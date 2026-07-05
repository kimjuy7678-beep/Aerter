const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
console.log('KAKAO_REST_API_KEY =', KAKAO_REST_API_KEY);

export function getKakaoCallbackUrl() {
    return `${window.location.origin}/oauth/kakao/callback`;
}

function randomState() {
    return Math.random().toString(36).slice(2);
}

export function loginWithKakaoPopup(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('브라우저 환경이 아닙니다.'));
            return;
        }

        const state = randomState();
        sessionStorage.setItem('kakao_oauth_state', state);

        const authUrl =
            `https://kauth.kakao.com/oauth/authorize` +
            `?response_type=code` +
            `&client_id=${encodeURIComponent(KAKAO_REST_API_KEY)}` +
            `&redirect_uri=${encodeURIComponent(getKakaoCallbackUrl())}` +
            `&state=${encodeURIComponent(state)}`;

        const popup = window.open(authUrl, 'kakao-login', 'width=480,height=640');
        if (!popup) {
            reject(new Error('팝업이 차단되었습니다. 브라우저에서 팝업을 허용한 뒤 다시 시도해주세요.'));
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.source !== 'kakao-login') return;

            window.removeEventListener('message', handleMessage);
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