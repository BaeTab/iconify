import React, { useState } from 'react';
import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileType, CheckCircle2, AlertCircle, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const IcoConverter: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrls, setPreviewUrls] = useState<{ size: number; url: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAdModal, setShowAdModal] = useState(false);
    const [isAdConfirmed, setIsAdConfirmed] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // Helper to generate previews
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
        setIsDragOver(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            const file = event.dataTransfer.files[0];
            processFile(file);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const processFile = (file: File) => {
        if (!file.type.match('image.*')) {
            alert("이미지 파일(PNG, JPG, WEBP)만 선택해주세요.");
            return;
        }
        setSelectedFile(file);
        generatePreviews(file);
        logEvent(analytics, 'select_image', { file_type: file.type });
    };

    const resetState = () => {
        setSelectedFile(null);
        setPreviewUrls([]);
        setIsProcessing(false);
        setIsAdConfirmed(false);
        logEvent(analytics, 'reset_state');
    };

    const handleDownloadClick = () => {
        if (isAdConfirmed) {
            convertToIco();
        } else {
            setShowAdModal(true);
            logEvent(analytics, 'show_ad_modal');
        }
    };

    const handleAdClick = () => {
        setIsAdConfirmed(true);
        setShowAdModal(false);
        logEvent(analytics, 'ad_click');
        window.open('https://www.adpick.co.kr/?ac=offer&offer=ffd70', '_blank');

        setTimeout(() => {
            convertToIco();
        }, 1000);
    };

    const convertToIco = async () => {
        if (!selectedFile) return;
        setIsProcessing(true);
        logEvent(analytics, 'convert_start');

        try {
            // Generating ICO: Standard sizes for Windows are 256, 48, 32, 16.
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

            logEvent(analytics, 'convert_success', { file_name: link.download });

        } catch (error) {
            console.error("Conversion failed:", error);
            alert("변환에 실패했습니다. 콘솔을 확인해주세요.");
            logEvent(analytics, 'convert_fail', { error: String(error) });
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
        <div className="w-full max-w-4xl mx-auto relative z-10">

            {/* Ad Confirmation Modal */}
            {showAdModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center animate-bounce">
                                <span className="text-4xl">🙏</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900">잠시만요!</h3>
                                <p className="text-muted-foreground">
                                    무료 서버 운영을 위해<br />
                                    <span className="font-bold text-primary">광고를 한번만 클릭</span>해 주세요.<br />
                                    클릭 후 변환된 파일이 자동으로 다운로드됩니다.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Button
                                    className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                                    onClick={handleAdClick}
                                >
                                    광고 보고 다운로드 시작
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowAdModal(false)}
                                >
                                    취소
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!selectedFile ? (
                <Card
                    className={cn(
                        "group relative border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
                        isDragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-6">
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileSelect}
                        />
                        <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                            isDragOver ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                            <Upload className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-foreground">
                                이미지를 선택하거나 드래그하세요
                            </h2>
                            <p className="text-muted-foreground font-medium">PNG, JPG, WEBP 지원</p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            {['PNG', 'JPG', 'WEBP'].map(ext => (
                                <div key={ext} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground border border-border">
                                    <FileType className="w-3.5 h-3.5" />
                                    {ext}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6 animate-fade-in-up">
                    <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
                        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">Selected File</p>
                                    <h3 className="text-lg font-bold text-foreground truncate max-w-[200px] md:max-w-md">
                                        {selectedFile.name}
                                    </h3>
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={resetState}
                                className="gap-2 shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">초기화</span>
                            </Button>
                        </div>

                        <CardContent className="p-6 md:p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Original Preview */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">원본 이미지</h4>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Original</span>
                                    </div>
                                    <div className="aspect-square rounded-2xl border border-border bg-muted/10 flex items-center justify-center p-6 overflow-hidden">
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Original"
                                            className="max-h-full max-w-full object-contain shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Generated Sizes Preview */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">변환 미리보기</h4>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">.ico</span>
                                    </div>
                                    <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 h-full min-h-[300px] flex flex-col items-center justify-center">
                                        <div className="flex flex-wrap items-end justify-center gap-6">
                                            {previewUrls.map((preview) => (
                                                <div key={preview.size} className="flex flex-col items-center gap-3 group">
                                                    <div className="p-2 lg:p-3 bg-background rounded-xl shadow-sm border border-border group-hover:border-primary/50 group-hover:shadow-md transition-all duration-300">
                                                        <img src={preview.url} alt={`${preview.size}x${preview.size}`} width={preview.size} height={preview.size} className="rendering-pixelated" />
                                                    </div>
                                                    <span className="text-xs font-mono font-medium text-muted-foreground group-hover:text-primary transition-colors">{preview.size}px</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center py-4 space-y-4">
                                <Button
                                    onClick={handleDownloadClick}
                                    disabled={isProcessing}
                                    size="lg"
                                    className="w-full md:w-auto min-w-[240px] h-14 text-lg font-bold gap-3 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            변환 중...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-6 h-6" />
                                            ICO 다운로드
                                        </>
                                    )}
                                </Button>
                                <p className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full">
                                    <AlertCircle className="w-4 h-4" />
                                    안전한 클라이언트 변환 • 서버 업로드 없음
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default IcoConverter;
