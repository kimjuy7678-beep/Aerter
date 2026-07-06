import { useEffect } from 'react';
import { getExpectedNaverState } from '../lib/Naver';

export default function NaverCallbackPage() {
    useEffect(() => {
        const hash = window.location.hash.startsWith('#')
            ? window.location.hash.slice(1)
            : window.location.hash;
        const params = new URLSearchParams(hash || window.location.search);
        const accessToken = params.get('access_token');
        const state = params.get('state');
        const expectedState = getExpectedNaverState();

        if (window.opener) {
            if (accessToken && state && state === expectedState) {
                window.opener.postMessage({ source: 'naver-login', accessToken }, window.location.origin);
            } else {
                window.opener.postMessage(
                    { source: 'naver-login', error: params.get('error_description') ?? params.get('error') ?? '네이버 로그인에 실패했습니다.' },
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