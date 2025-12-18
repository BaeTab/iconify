import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

const SEO: React.FC<SEOProps> = ({
    title = "Iconify - 무료 PNG/JPG ICO 변환기 (파비콘 생성)",
    description = "PNG, JPG, WEBP 이미지를 윈도우용 아이콘(.ico)으로 즉시 변환하세요. 100% 클라이언트 처리로 안전하며, 파일이 서버에 업로드되지 않습니다.",
    keywords = "ico 변환, 파비콘 만들기, png ico 변환, jpg ico 변환, 무료 아이콘 생성기, iconify",
    image = "/og-image.png",
    url = "https://iconify-ico.web.app"
}) => {
    return (
        <Helmet>
            {/* Basic */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
