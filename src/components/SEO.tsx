import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
}

const SITE_NAME = 'AERHER';
const DEFAULT_DESCRIPTION =
    '보이지 않는 공기처럼 순수하고 섬세한 향을 빚어내는 프리미엄 향수 브랜드, AERHER.';

export default function SEO({ title, description = DEFAULT_DESCRIPTION, image }: SEOProps) {
    const fullTitle = title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
}