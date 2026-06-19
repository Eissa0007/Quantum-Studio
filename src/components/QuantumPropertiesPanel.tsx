export const QuantumPropertiesPanel = () => {
  return (
    <aside className="hidden md:block w-[240px] bg-white dark:bg-[#1A1A2E] border-l border-[rgba(0,0,0,0.08)] dark:border-gray-800 p-4 h-full overflow-y-auto z-10 relative">
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-400 uppercase">Text Styles</label>
        <div className="mt-3 space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-800 text-sm font-medium">Montserrat Black</div>
          <div className="flex gap-2">
            <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded text-center text-sm font-medium">72px</div>
            <div className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 bg-black dark:bg-white"></div>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-400 uppercase">Layers</label>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm p-2 bg-cyan-50 dark:bg-[#00C4CC]/10 text-cyan-700 dark:text-[#00C4CC] rounded">
            <span className="font-bold font-mono">T</span> Main Heading
          </div>
          <div className="flex items-center gap-2 text-sm p-2 text-gray-700 dark:text-gray-300">
            <span className="font-bold font-mono">P</span> Subtitle Text
          </div>
          <div className="flex items-center gap-2 text-sm p-2 text-gray-700 dark:text-gray-300">
            <span className="font-bold font-mono">S</span> Background Rect
          </div>
        </div>
      </div>
    </aside>
  );
};
