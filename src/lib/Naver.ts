const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;

function getCallbackUrl() {
    return `${window.location.origin}/oauth/naver/callback`;
}

function randomState() {
    return Math.random().toString(36).slice(2);
}

export function loginWithNaverPopup(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('브라우저 환경이 아닙니다.'));
            return;
        }

        const state = randomState();
        sessionStorage.setItem('naver_oauth_state', state);

        const authUrl =
            `https://nid.naver.com/oauth2.0/authorize` +
            `?response_type=token` +
            `&client_id=${encodeURIComponent(NAVER_CLIENT_ID)}` +
            `&redirect_uri=${encodeURIComponent(getCallbackUrl())}` +
            `&state=${encodeURIComponent(state)}`;

        const popup = window.open(authUrl, 'naver-login', 'width=480,height=640');
        if (!popup) {
            reject(new Error('팝업이 차단되었습니다. 브라우저에서 팝업을 허용한 뒤 다시 시도해주세요.'));
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.source !== 'naver-login') return;

            window.removeEventListener('message', handleMessage);
            try {
                popup.close();
            } catch {
                /* noop */
            }

            if (event.data.error) {
                reject(new Error(event.data.error));
            } else {
                resolve(event.data.accessToken as string);
            }
        };

        window.addEventListener('message', handleMessage);
    });
}