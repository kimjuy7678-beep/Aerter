import { Link } from 'react-router';
import SEO from '../components/SEO';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-20 text-center">
            <SEO title="페이지를 찾을 수 없습니다" description="요청하신 페이지를 찾을 수 없습니다." />
            <p className="font-cormorant text-[120px] md:text-[160px] leading-none text-foreground/10 select-none">
                404
            </p>
            <h1 className="font-cormorant text-[32px] md:text-[40px] font-normal text-foreground -mt-8 mb-4">
                페이지를 찾을 수 없습니다
            </h1>
            <p className="font-pretendard font-light text-[14px] text-muted-foreground mb-10 max-w-[360px]">
                주소가 잘못되었거나, 삭제되었거나, 이동된 페이지일 수 있어요.
            </p>
            <div className="flex gap-4">
                <Link
                    to="/"
                    className="font-pretendard font-light text-[12px] tracking-[0.25em] text-background bg-foreground px-8 py-4 hover:bg-foreground/85 transition-all duration-300"
                >
                    홈으로
                </Link>
                <Link
                    to="/collection"
                    className="font-pretendard font-light text-[12px] tracking-[0.25em] text-foreground border border-foreground px-8 py-4 hover:bg-foreground hover:text-background transition-all duration-300"
                >
                    컬렉션 보기
                </Link>
            </div>
        </div>
    );
}