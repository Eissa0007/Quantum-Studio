import { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useStore } from "../store/useStore";
import { useAuth } from "../components/AuthProvider";
import { loadAllLocalProjects, saveProjectLocally, OfflineQueueItem } from "../utils/offlineManager";
import { useOfflineSync } from "./useOfflineSync";

export const useProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentProject, isConnected } = useStore();
  const { user } = useAuth();
  const { isOnline } = useOfflineSync();

  const loadProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (!isOnline || !supabase || !isConnected) {
        // Load from IndexedDB
        const localProjects = await loadAllLocalProjects();
        setProjects(localProjects);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq('is_deleted', false)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      
      // Sync loaded projects to local storage for offline use
      if (data) {
        data.forEach(p => saveProjectLocally(p.id, p.data, 'update'));
      }
      
    } catch (err: any) {
      console.error("Failed to load projects:", err);
      setError("فشل في تحميل المشاريع. حاول مرة أخرى.");
      
      // Fallback
      if (!projects.length) {
         const localProjects = await loadAllLocalProjects();
         setProjects(localProjects);
      }
    } finally {
      setLoading(false);
    }
  }, [isConnected, user, isOnline]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (!user || !supabase || !isConnected) return;
    
    const channel = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' }, // Ideally filter by user_id
        (payload) => {
          loadProjects(); // Or optimistically update the state
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, isConnected, loadProjects]);

  const createProject = async (title = "مشروع جديد") => {
    if (!user) {
      useStore.getState().setShowLoginModal(true);
      return null;
    }

    try {
      const emptyData = {
        version: "5.3.0",
        objects: [],
        background: "#ffffff",
      };

      if (!isOnline || !supabase || !isConnected) {
         // Offline create
         const newId = crypto.randomUUID();
         const newProject = { id: newId, title, data: emptyData, updated_at: new Date().toISOString() };
         await saveProjectLocally(newId, emptyData, 'create');
         setProjects([newProject, ...projects]);
         setCurrentProject(newProject);
         return newProject;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert([{ title, data: emptyData }])
        .select()
        .single();

      if (error) throw error;

      setProjects([data, ...projects]);
      setCurrentProject(data);
      return data;
    } catch (err: any) {
      console.error("Failed to create project:", err);
      setError("فشل في إنشاء المشروع: " + err.message);
      return null;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      if (!isOnline || !supabase || !isConnected) {
         await saveProjectLocally(id, null, 'delete');
         setProjects(projects.filter((p) => p.id !== id));
         return true;
      }

      const { error } = await supabase
        .from("projects")
        .update({ is_deleted: true })
        .eq("id", id);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      console.error("Failed to delete project:", err);
      return false;
    }
  };

  const duplicateProject = async (id: string) => {
    if (!user) return null;
    try {
      const sourceProject = projects.find(p => p.id === id);
      if (!sourceProject) return null;
      
      const newTitle = `${sourceProject.title} (نسخة)`;
      
      if (!isOnline || !supabase || !isConnected) {
         const newId = crypto.randomUUID();
         const newProj = { ...sourceProject, id: newId, title: newTitle, updated_at: new Date().toISOString() };
         await saveProjectLocally(newId, sourceProject.data, 'create');
         setProjects([newProj, ...projects]);
         return newProj;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert([{ title: newTitle, data: sourceProject.data }])
        .select()
        .single();

      if (error) throw error;
      setProjects([data, ...projects]);
      return data;
    } catch(err) {
      console.error("Failed to duplicate:", err);
      return null;
    }
  }

  const openProject = (project: any) => {
    setCurrentProject(project);
  };

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    deleteProject,
    duplicateProject,
    openProject,
  };
};

