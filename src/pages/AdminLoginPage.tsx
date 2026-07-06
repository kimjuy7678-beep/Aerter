import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import SEO from '../components/SEO';

export default function AdminLoginPage() {
    const { loginAdmin, loading, error } = useAdminAuthStore();
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginAdmin(password);
            navigate('/admin', { replace: true });
        } catch {
            // error is already reflected in the store
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
            <SEO title="관리자 로그인" />
            <div className="w-full max-w-[360px]">
                <h1 className="font-cormorant text-[28px] font-normal text-foreground tracking-wide text-center mb-8">
                    관리자 로그인
                </h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="관리자 비밀번호"
                        required
                        autoFocus
                        className="w-full border-b border-border bg-transparent font-pretendard font-light text-[14px] text-foreground py-3 outline-none focus:border-foreground transition-colors placeholder-foreground/25"
                    />
                    {error && (
                        <p className="font-pretendard font-light text-[12px] text-red-500" role="alert">
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-[52px] bg-foreground text-background font-pretendard font-normal text-[14px] tracking-wide hover:bg-foreground/85 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? '확인 중...' : '로그인'}
                    </button>
                </form>
            </div>
        </div>
    );
}