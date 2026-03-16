import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-dark-900 text-dark-50 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64 relative min-h-screen">
        {/* Background Gradients */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none z-0"></div>
        
        {/* Main Content Area */}
        <div className="relative z-10 w-full h-full p-4 md:p-8">
          <main className="max-w-7xl mx-auto h-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
