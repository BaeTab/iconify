import React from 'react';

const HowToUse: React.FC = () => {
    const steps = [
        {
            step: 1,
            title: "이미지 업로드",
            description: "PNG, JPG, WEBP 파일을 드래그하거나 클릭하여 선택하세요."
        },
        {
            step: 2,
            title: "자동 변환",
            description: "Iconify가 즉시 윈도우용 아이콘 규격으로 이미지를 변환합니다."
        },
        {
            step: 3,
            title: "ICO 다운로드",
            description: "변환된 파일을 다운로드하여 바로 사용하세요."
        }
    ];

    return (
        <div className="py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">사용 방법</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-1 bg-blue-100 -z-10"></div>

                    {steps.map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-6 z-10">
                                {item.step}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                            <p className="text-gray-600 max-w-xs">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HowToUse;
