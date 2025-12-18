import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';
import AdSense from './components/AdSense';
import Features from './components/Features';
import HowToUse from './components/HowToUse';
import IcoConverter from './IcoConverter';

function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-transparent flex flex-col font-sans text-gray-900">
        <SEO />

        {/* Header */}
        <header className="bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 transition-all">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <span className="text-2xl">⚡</span> Iconify
            </h1>
            <nav>
              <ul className="flex space-x-4 text-sm text-gray-600 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">홈</a></li>
              </ul>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">

          <div className="container mx-auto px-4 py-8">
            {/* AdSense Top Banner */}
            <AdSense slot="1234567890" className="text-center" />

            {/* Hero Section */}
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 tracking-tight">
                PNG to ICO 무료 변환기
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                이미지를 윈도우용 아이콘 파일(.ico)로 즉시 변환하세요.<br />
                <span className="font-semibold text-gray-800">100% 클라이언트 처리, 서버 업로드 없이 안전합니다.</span>
              </p>
            </div>

            {/* Tool Section */}
            <IcoConverter />

            {/* AdSense In-Article */}
            <AdSense slot="0987654321" format="fluid" />
          </div>

          {/* Features Section */}
          <Features />

          {/* How to Use Section */}
          <HowToUse />

          {/* Content Section (SEO) */}
          <div className="container mx-auto px-4 py-16">
            <section className="max-w-4xl mx-auto bg-white/60 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-lg border border-white/20">

              <div className="mb-10">
                <h3 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <span className="text-3xl">📂</span> ICO 파일이란?
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  ICO 파일은 <strong>Microsoft Windows</strong>의 아이콘 시스템을 위한 표준 이미지 포맷입니다.
                  단일 파일 내에 다양한 해상도(16px, 32px, 48px, 128px 등)의 이미지를 모두 담을 수 있다는 특징이 있습니다.
                  덕분에 데스크탑, 탐색기, 작업 표시줄 등 어떤 화면 크기에서도 깨지지 않는 <strong>최적의 선명도</strong>를 유지할 수 있습니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">⚡</span> 왜 클라이언트 변환인가요?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    대부분의 온라인 도구는 서버로 이미지를 전송해야 합니다.
                    하지만 <strong>Iconify</strong>는 다릅니다. 최신 브라우저 기술을 활용하여
                    여러분의 PC에서 직접 변환이 이루어집니다.
                    <span className="block mt-2 font-medium text-blue-700">✅ 서버 전송 0% = 해킹 위험 0%</span>
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🎨</span> 파비콘(Favicon) 만들기
                  </h3>
                  <ol className="list-decimal list-inside text-gray-600 space-y-2">
                    <li>로고 이미지(PNG, JPG)를 업로드합니다.</li>
                    <li>고속 변환 과정을 거칩니다.</li>
                    <li><span className="font-bold text-blue-600">ICO 다운로드</span> 버튼을 누릅니다.</li>
                    <li>파일명을 <code>favicon.ico</code>로 변경 후 적용합니다.</li>
                  </ol>
                </div>
              </div>

            </section>
          </div>

        </main>

        <footer className="bg-white/40 backdrop-blur-md border-t border-white/20 py-8 text-center text-sm text-gray-600">
          <div className="container mx-auto px-4">
            <p>&copy; {new Date().getFullYear()} Iconify. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-blue-600 transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-blue-600 transition-colors">이용약관</a>
            </div>
          </div>
        </footer>

      </div>
    </HelmetProvider>
  );
}

export default App;
