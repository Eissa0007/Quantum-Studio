import { useProjects } from "../hooks/useProjects";
import { useStore } from "../store/useStore";
import { Loader2, Plus, Copy, Trash2, FolderPlus, LogIn } from "lucide-react";
import { useAuth } from "./AuthProvider";

export const QuantumProjectsView = () => {
  const {
    projects,
    loading,
    error,
    createProject,
    deleteProject,
    duplicateProject,
    openProject,
    loadProjects,
  } = useProjects();
  const { setActivePanel, setShowLoginModal } = useStore();
  const { user } = useAuth();

  const handleOpen = (project: any) => {
    openProject(project);
    setActivePanel("elements"); // Swaps to editor canvas
  };

  const handleCreateNew = async () => {
    const proj = await createProject("مشروع جديد");
    if (proj) {
      setActivePanel("elements");
    }
  };

  return (
    <div
      className="p-8 w-full h-full bg-white dark:bg-[#0F1419] overflow-y-auto"
      dir="rtl"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          المشاريع
        </h1>
        <button
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-[#00C4CC] to-[#7D3CFF] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-[#00C4CC]/20"
        >
          <Plus size={18} />
          مشروع جديد
        </button>
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center py-32 text-center text-gray-500">
          <LogIn size={48} className="mb-4 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            يرجى تسجيل الدخول
          </h2>
          <p className="mb-6">
            سجل الدخول لرؤية مشاريعك السحابية وإنشاء مشاريع جديدة
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-gradient-to-r from-[#00C4CC] to-[#7D3CFF] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          >
            تسجيل الدخول
          </button>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-4 max-w-md">
            {error}
          </div>
          <button
            onClick={loadProjects}
            className="text-[#00C4CC] hover:underline flex items-center gap-2"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center text-gray-500">
          <FolderPlus size={48} className="mb-4 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            لا توجد مشاريع بعد
          </h2>
          <p className="mb-6">
            ابدأ بإنشاء مشروع جديد لتصميم واجهتك المستقبلية
          </p>
          <button
            onClick={handleCreateNew}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            إنشاء مشروع جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="relative group flex flex-col">
              <div
                onClick={() => handleOpen(project)}
                className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl cursor-pointer hover:ring-2 ring-[#7D3CFF] overflow-hidden flex items-center justify-center relative shadow-sm transition-all group-hover:shadow-md border border-gray-200 dark:border-gray-800"
              >
                {project.thumbnail_url ? (
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 font-medium text-sm">
                    لا توجد معاينة
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <span className="bg-white text-black px-4 py-1.5 rounded-lg font-semibold text-sm">
                    فتح المشروع
                  </span>
                </div>
              </div>
              <div className="mt-3 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(project.updated_at).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => duplicateProject(project.id)}
                    className="p-1.5 text-gray-500 hover:text-[#00C4CC] hover:bg-[#00C4CC]/10 rounded-md transition-colors"
                    title="تكرار"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
