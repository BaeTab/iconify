import React from 'react';

const Features: React.FC = () => {
    const features = [
        {
            icon: "🚀",
            title: "압도적인 속도",
            description: "복잡한 서버 통신 없이 브라우저에서 즉시 변환됩니다."
        },
        {
            icon: "🔒",
            title: "완벽한 보안",
            description: "이미지가 서버로 전송되지 않습니다. 100% 로컬에서 처리되니 안심하세요."
        },
        {
            icon: "💎",
            title: "고품질 변환",
            description: "16px부터 128px까지, 윈도우와 웹 환경에 최적화된 아이콘을 생성합니다."
        }
    ];

    return (
        <div className="py-16 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;
