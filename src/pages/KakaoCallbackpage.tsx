import { useEffect } from 'react';
import { getExpectedKakaoState } from '../lib/Kakao';

export default function KakaoCallbackPage() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');
        const expectedState = getExpectedKakaoState();

        if (window.opener) {
            if (code && state && state === expectedState && !errorParam) {
                window.opener.postMessage({ source: 'kakao-login', code }, window.location.origin);
            } else {
                window.opener.postMessage(
                    { source: 'kakao-login', error: errorParam ?? '카카오 로그인에 실패했습니다.' },
                    window.location.origin
                );
            }
        }

        window.close();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="font-pretendard font-light text-[13px] text-muted-foreground">
                로그인 처리 중...
            </p>
        </div>
    );
}