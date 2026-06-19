export const QuantumPagesPanel = () => {
  return (
    <div className="hidden md:flex h-16 bg-white/50 backdrop-blur-sm dark:bg-[#1A1A2E]/50 border-t border-[rgba(0,0,0,0.08)] dark:border-gray-800 p-2 items-center space-x-4 overflow-x-auto absolute bottom-0 left-0 right-0 z-10 w-full">
      {[1,2,3].map((page) => (
        <div key={page} className="w-16 h-12 bg-white dark:bg-[#121212] rounded shadow-sm hover:ring-2 ring-[#00C4CC] transition-all cursor-pointer flex items-center justify-center text-[10px] font-medium text-gray-400">
          Page {page}
        </div>
      ))}
    </div>
  );
};
