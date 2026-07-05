import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp();

interface KakaoProfileResponse {
    id: number;
    kakao_account?: {
        email?: string;
        profile?: {
            nickname?: string;
            profile_image_url?: string;
        };
    };
}

interface NaverProfileResponse {
    response: {
        id: string;
        email?: string;
        name?: string;
        profile_image?: string;
    };
}

interface UserFields {
    displayName?: string;
    photoURL?: string;
    email?: string;
}

function cleanFields(fields: UserFields): UserFields {
    const cleaned: UserFields = {};
    if (fields.displayName) cleaned.displayName = fields.displayName;
    if (fields.photoURL) cleaned.photoURL = fields.photoURL;
    if (fields.email) cleaned.email = fields.email;
    return cleaned;
}

async function upsertFirebaseUser(uid: string, rawFields: UserFields) {
    const fields = cleanFields(rawFields);
    try {
        if (Object.keys(fields).length > 0) {
            await getAuth().updateUser(uid, fields);
        }
    } catch (err) {
        try {
            await getAuth().createUser({ uid, ...fields });
        } catch (createErr) {
            console.error('upsertFirebaseUser failed for uid', uid, {
                updateError: err,
                createError: createErr,
                fields,
            });
            throw createErr;
        }
    }
}

export const kakaoLogin = onCall(async (request) => {
    try {
        const { code, redirectUri } = (request.data ?? {}) as {
            code?: string;
            redirectUri?: string;
        };
        if (!code || !redirectUri) {
            throw new HttpsError('invalid-argument', 'code와 redirectUri가 필요합니다.');
        }

        const restApiKey = process.env.KAKAO_REST_API_KEY;
        const clientSecret = process.env.KAKAO_CLIENT_SECRET;
        if (!restApiKey) {
            console.error('KAKAO_REST_API_KEY is not set (functions/.env)');
            throw new HttpsError('failed-precondition', '서버에 카카오 키가 설정되지 않았습니다.');
        }

        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: restApiKey,
            redirect_uri: redirectUri,
            code,
        });
        if (clientSecret) tokenParams.set('client_secret', clientSecret);

        const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: tokenParams.toString(),
        });
        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            console.error('Kakao token exchange failed:', tokenRes.status, errText);
            throw new HttpsError('unauthenticated', '카카오 토큰 발급에 실패했습니다.');
        }
        const { access_token: accessToken } = (await tokenRes.json()) as { access_token: string };

        const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!profileRes.ok) {
            const errText = await profileRes.text();
            console.error('Kakao profile fetch failed:', profileRes.status, errText);
            throw new HttpsError('unauthenticated', '카카오 프로필 조회에 실패했습니다.');
        }
        const profile = (await profileRes.json()) as KakaoProfileResponse;

        const uid = `kakao:${profile.id}`;
        const email = profile.kakao_account?.email;
        const displayName = profile.kakao_account?.profile?.nickname ?? '카카오 사용자';
        const photoURL = profile.kakao_account?.profile?.profile_image_url;

        await upsertFirebaseUser(uid, { displayName, photoURL, email });

        const token = await getAuth().createCustomToken(uid, { provider: 'kakao' });
        return { token };
    } catch (err) {
        if (err instanceof HttpsError) throw err;
        console.error('kakaoLogin unexpected error:', err);
        throw new HttpsError('internal', '카카오 로그인 처리 중 오류가 발생했습니다.');
    }
});

export const naverLogin = onCall(async (request) => {
    try {
        const { accessToken } = (request.data ?? {}) as { accessToken?: string };
        if (!accessToken) {
            throw new HttpsError('invalid-argument', 'accessToken이 필요합니다.');
        }

        const res = await fetch('https://openapi.naver.com/v1/nid/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
            const errText = await res.text();
            console.error('Naver profile fetch failed:', res.status, errText);
            throw new HttpsError('unauthenticated', '유효하지 않은 네이버 액세스 토큰입니다.');
        }

        const { response: profile } = (await res.json()) as NaverProfileResponse;
        const uid = `naver:${profile.id}`;
        const email = profile.email;
        const displayName = profile.name ?? '네이버 사용자';
        const photoURL = profile.profile_image;

        await upsertFirebaseUser(uid, { displayName, photoURL, email });

        const token = await getAuth().createCustomToken(uid, { provider: 'naver' });
        return { token };
    } catch (err) {
        if (err instanceof HttpsError) throw err;
        console.error('naverLogin unexpected error:', err);
        throw new HttpsError('internal', '네이버 로그인 처리 중 오류가 발생했습니다.');
    }
});