const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const KAKAO_STATE_KEY = 'kakao_oauth_state';
const OAUTH_POPUP_FEATURES = 'width=480,height=640';

export function getKakaoCallbackUrl() {
    return `${window.location.origin}/oauth/kakao/callback`;
}

function randomState() {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function clearKakaoState() {
    localStorage.removeItem(KAKAO_STATE_KEY);
}

export function getExpectedKakaoState() {
    return localStorage.getItem(KAKAO_STATE_KEY);
}

export function loginWithKakaoPopup(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('브라우저 환경이 아닙니다.'));
            return;
        }

        if (!KAKAO_REST_API_KEY) {
            reject(new Error('카카오 REST API 키가 설정되지 않았습니다.'));
            return;
        }

        const state = randomState();
        localStorage.setItem(KAKAO_STATE_KEY, state);

        const authUrl =
            `https://kauth.kakao.com/oauth/authorize` +
            `?response_type=code` +
            `&client_id=${encodeURIComponent(KAKAO_REST_API_KEY)}` +
            `&redirect_uri=${encodeURIComponent(getKakaoCallbackUrl())}` +
            `&state=${encodeURIComponent(state)}`;

        const popup = window.open(authUrl, 'kakao-login', OAUTH_POPUP_FEATURES);
        if (!popup) {
            clearKakaoState();
            reject(new Error('팝업이 차단되었습니다. 브라우저에서 팝업을 허용한 뒤 다시 시도해주세요.'));
            return;
        }

        const popupClosedTimer = window.setInterval(() => {
            if (!popup.closed) return;
            cleanup();
            reject(new Error('로그인 창이 닫혔습니다. 다시 시도해주세요.'));
        }, 500);

        const cleanup = () => {
            window.clearInterval(popupClosedTimer);
            window.removeEventListener('message', handleMessage);
            clearKakaoState();
        };

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.source !== 'kakao-login') return;

            cleanup();
            try {
                popup.close();
            } catch {
                /* noop */
            }

            if (event.data.error) {
                reject(new Error(event.data.error));
            } else {
                resolve(event.data.code as string);
            }
        };

        window.addEventListener('message', handleMessage);
    });
}