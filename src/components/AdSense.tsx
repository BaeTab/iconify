import React, { useEffect } from 'react';

interface AdSenseProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    fullWidthResponsive?: boolean;
    style?: React.CSSProperties;
    className?: string;
    client?: string;
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const AdSense: React.FC<AdSenseProps> = ({
    slot,
    format = "auto",
    fullWidthResponsive = true,
    style = { display: 'block' },
    className = "",
    client = "ca-pub-0000000000000000" // Placeholder
}) => {

    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    if (import.meta.env.DEV) {
        return (
            <div className={`flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-400 text-gray-500 font-bold p-4 my-4 ${className}`} style={{ minHeight: '100px', ...style }}>
                AdSense Placeholder (Slot: {slot})
            </div>
        );
    }

    return (
        <div className={`ad-container my-4 ${className}`}>
            <ins className="adsbygoogle"
                style={style}
                data-ad-client={client}
                data-ad-slot={slot}
                data-ad-format={format}
                data-ad-full-width-responsive={fullWidthResponsive ? "true" : "false"}
            />
        </div>
    );
};

export default AdSense;
