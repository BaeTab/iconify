import React, { useState } from 'react';

const IcoConverter: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrls, setPreviewUrls] = useState<{ size: number; url: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAdModal, setShowAdModal] = useState(false);
    const [isAdConfirmed, setIsAdConfirmed] = useState(false);

    // Helper to generate previews (includes 256px in preview?)
    // Let's keep preview simple or add 256
    const generatePreviews = async (file: File) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = objectUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        // Show previews for these sizes
        const sizes = [16, 32, 48, 128];
        const newPreviews: { size: number; url: string }[] = [];

        for (const size of sizes) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Better quality for preview
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img, 0, 0, size, size);
                const dataUrl = canvas.toDataURL('image/png');
                newPreviews.push({ size, url: dataUrl });
            }
        }
        setPreviewUrls(newPreviews);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            processFile(file);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            const file = event.dataTransfer.files[0];
            processFile(file);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const processFile = (file: File) => {
        if (!file.type.match('image.*')) {
            alert("이미지 파일(PNG, JPG, WEBP)만 선택해주세요.");
            return;
        }
        setSelectedFile(file);
        generatePreviews(file);
    };

    const resetState = () => {
        setSelectedFile(null);
        setPreviewUrls([]);
        setIsProcessing(false);
        setIsAdConfirmed(false);
    };

    const handleDownloadClick = () => {
        if (isAdConfirmed) {
            convertToIco();
        } else {
            setShowAdModal(true);
        }
    };

    const handleAdClick = () => {
        setIsAdConfirmed(true);
        setShowAdModal(false);
        window.open('https://www.adpick.co.kr/?ac=offer&offer=ffd70', '_blank');

        setTimeout(() => {
            convertToIco();
        }, 1000);
    };

    const convertToIco = async () => {
        if (!selectedFile) return;
        setIsProcessing(true);

        try {
            // Generating ICO: Standard sizes for Windows are 256, 48, 32, 16.
            // 256x256 is the standard "Jumbo" icon. 128x128 is less common but valid.
            // We'll calculate from largest to smallest to ensure high-quality thumbnail preview in OS.
            const sizes = [256, 128, 48, 32, 16];
            const images: Blob[] = [];

            const img = new Image();
            img.src = URL.createObjectURL(selectedFile);
            await new Promise((resolve) => { img.onload = resolve; });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Canvas context not available");

            for (const size of sizes) {
                canvas.width = size;
                canvas.height = size;
                ctx.clearRect(0, 0, size, size);
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, size, size);

                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                if (blob) images.push(blob);
            }

            // Pass the sizes order explicitly to ensure sync
            const icoBlob = await generateIcoBlob(images, sizes);

            const link = document.createElement('a');
            link.href = URL.createObjectURL(icoBlob);

            // Use timestamp to prevent Windows icon caching issues
            const timestamp = new Date().getTime();
            link.download = `favicon_${timestamp}.ico`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Conversion failed:", error);
            alert("변환에 실패했습니다. 콘솔을 확인해주세요.");
        } finally {
            setIsProcessing(false);
        }
    };

    const generateIcoBlob = async (pngBlobs: Blob[], sizes: number[]): Promise<Blob> => {
        const headerSize = 6;
        const directoryEntrySize = 16;
        const numImages = pngBlobs.length;

        let offset = headerSize + (numImages * directoryEntrySize);

        const header = new Uint8Array(headerSize);
        const view = new DataView(header.buffer);
        view.setUint16(0, 0, true);
        view.setUint16(2, 1, true);
        view.setUint16(4, numImages, true);

        const parts: BlobPart[] = [header];
        const directory = new Uint8Array(numImages * directoryEntrySize);
        const dirView = new DataView(directory.buffer);

        const imageParts: Blob[] = [];

        for (let i = 0; i < numImages; i++) {
            const pngBlob = pngBlobs[i];
            const arrayBuffer = await pngBlob.arrayBuffer();
            const size = arrayBuffer.byteLength;

            const width = sizes[i];
            const height = width;

            const entryOffset = i * directoryEntrySize;

            // Width/Height: 0 means 256px. Others are 1-255.
            dirView.setUint8(entryOffset + 0, width === 256 ? 0 : width);
            dirView.setUint8(entryOffset + 1, height === 256 ? 0 : height);

            dirView.setUint8(entryOffset + 2, 0); // Color palette
            dirView.setUint8(entryOffset + 3, 0); // Reserved
            dirView.setUint16(entryOffset + 4, 1, true); // Planes
            dirView.setUint16(entryOffset + 6, 32, true); // BPP
            dirView.setUint32(entryOffset + 8, size, true); // Size
            dirView.setUint32(entryOffset + 12, offset, true); // Offset

            offset += size;
            imageParts.push(pngBlob);
        }

        parts.push(directory);
        imageParts.forEach(part => parts.push(part));

        return new Blob(parts, { type: 'image/x-icon' });
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 relative">

            {/* Ad Confirmation Modal */}
            {showAdModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-blue-100">
                        <div className="text-5xl mb-4">🙏</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">잠시만요!</h3>
                        <p className="text-gray-600 mb-6">
                            무료 서버 운영을 위해<br />
                            <span className="font-bold text-blue-600">광고를 한번만 클릭</span>해 주세요.<br />
                            클릭 후 변환된 파일이 자동으로 다운로드됩니다.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={handleAdClick}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105"
                            >
                                광고 보고 다운로드 시작
                            </button>
                            <button
                                onClick={() => setShowAdModal(false)}
                                className="w-full text-gray-400 text-sm hover:text-gray-600 font-medium py-2"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!selectedFile ? (
                <div
                    className="group relative border-4 border-dashed border-blue-200 hover:border-blue-400 rounded-2xl p-12 text-center transition-all duration-300 ease-in-out cursor-pointer hover:bg-blue-50/50"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    <input
                        type="file"
                        id="fileInput"
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileSelect}
                    />
                    <div className="space-y-6 transform group-hover:scale-105 transition-transform duration-300">
                        <div className="text-7xl animate-bounce">🖼️</div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                이미지를 클릭 또는 드래그하세요
                            </h2>
                            <p className="text-gray-500 font-medium">PNG, JPG, WEBP 지원</p>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300 pointer-events-none" />
                </div>
            ) : (
                <div className="animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-700 truncate max-w-md">
                            선택됨: <span className="text-blue-600">{selectedFile.name}</span>
                        </h3>
                        <button
                            onClick={resetState}
                            className="text-sm text-gray-500 hover:text-red-500 font-medium px-3 py-1 bg-gray-100 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            초기화 / 새 파일
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Original Preview */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">원본 이미지</span>
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="Original"
                                className="max-h-48 max-w-full object-contain shadow-lg rounded-lg"
                            />
                        </div>

                        {/* Generated Sizes Preview */}
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 block text-center">아이콘 미리보기</span>
                            <div className="flex flex-wrap items-end justify-center gap-6 mt-4">
                                {previewUrls.map((preview) => (
                                    <div key={preview.size} className="flex flex-col items-center group">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow">
                                            <img src={preview.url} alt={`${preview.size}x${preview.size}`} width={preview.size} height={preview.size} />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-2 font-mono">{preview.size}x{preview.size}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleDownloadClick}
                            disabled={isProcessing}
                            className={`
                relative overflow-hidden group
                bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                text-white font-bold py-4 px-12 rounded-full text-xl shadow-xl 
                transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              `}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        변환 중...
                                    </>
                                ) : (
                                    <>
                                        <span>ICO 다운로드</span>
                                        <span className="group-hover:translate-y-1 transition-transform text-2xl">⬇️</span>
                                    </>
                                )}
                            </span>
                        </button>
                        <p className="mt-4 text-sm text-gray-400">안전한 클라이언트 변환 • 서버 업로드 없음</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IcoConverter;
