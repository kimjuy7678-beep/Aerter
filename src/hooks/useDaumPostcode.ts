// Kakao (Daum) Postcode Service
// Docs: https://postcode.map.daum.net/guide
// NOTE: In sandboxed environments (Figma Make preview, localhost with strict CSP),
// the external script from t1.daumcdn.net may be blocked. This is expected behaviour.
// The service works correctly in production deployments.

export interface DaumAddressResult {
  zonecode: string;      // 우편번호 (5자리)
  address: string;       // 기본 주소 (도로명)
  roadAddress: string;   // 도로명 주소
  jibunAddress: string;  // 지번 주소
  buildingName: string;  // 건물명
  addressType: 'R' | 'J';
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumAddressResult) => void;
        onclose?: () => void;
        theme?: Record<string, string>;
      }) => { open: () => void };
    };
  }
}

const SCRIPT_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.daum?.Postcode) { resolve(); return; }
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('BLOCKED'));
    document.head.appendChild(script);
  });
}

export type PostcodeStatus = 'idle' | 'loading' | 'unavailable';

export function useDaumPostcode() {
  const open = async (
    onComplete: (result: DaumAddressResult) => void,
    onUnavailable?: () => void,
  ) => {
    try {
      await loadScript();
      if (!window.daum?.Postcode) throw new Error('BLOCKED');
      new window.daum.Postcode({
        oncomplete: (data) => {
          onComplete({ ...data, address: data.roadAddress || data.jibunAddress || data.address });
        },
        theme: {
          bgColor: '#ffffff',
          searchBgColor: '#f9f7f5',
          contentBgColor: '#ffffff',
          pageBgColor: '#f9f7f5',
          textColor: '#1a1a1a',
          queryTextColor: '#1a1a1a',
          postcodeTextColor: '#808080',
          emphTextColor: '#1a1a1a',
          outlineColor: '#e0ddd9',
        },
      }).open();
    } catch {
      // Script blocked (sandbox / CSP) — trigger fallback
      onUnavailable?.();
    }
  };

  return { openPostcode: open };
}
