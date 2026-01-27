import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PageContent {
  id: string;
  page_key: string;
  title: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  last_updated: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch a single page by key
export const usePageContent = (pageKey: string) => {
  return useQuery({
    queryKey: ["page-content", pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_key", pageKey)
        .eq("is_published", true)
        .single();

      if (error) {
        console.error("Error fetching page content:", error);
        return null;
      }
      return data as PageContent;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

// Admin: Fetch all pages
export const useAllPages = () => {
  return useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .order("page_key", { ascending: true });

      if (error) {
        console.error("Error fetching pages:", error);
        throw error;
      }
      return data as PageContent[];
    },
  });
};

// Admin: Update page content
export const useUpdatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<PageContent>;
    }) => {
      const { data, error } = await supabase
        .from("page_content")
        .update({
          ...updates,
          last_updated: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      queryClient.invalidateQueries({ queryKey: ["page-content", data.page_key] });
      toast.success("Page updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating page:", error);
      toast.error("Failed to update page");
    },
  });
};

// Admin: Create new page
export const useCreatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (page: Omit<PageContent, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("page_content")
        .insert({
          ...page,
          last_updated: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Page created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating page:", error);
      if (error.code === "23505") {
        toast.error("A page with this key already exists");
      } else {
        toast.error("Failed to create page");
      }
    },
  });
};

// Admin: Delete page
export const useDeletePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Page deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting page:", error);
      toast.error("Failed to delete page");
    },
  });
};
