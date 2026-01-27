import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Plus, Trash2, Edit, Eye, EyeOff, Save, X,
  Search, Settings, Globe, Code, Type, List, Image,
  Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, ListOrdered, Quote, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAllPages,
  useUpdatePage,
  useCreatePage,
  useDeletePage,
  PageContent,
} from "@/hooks/usePageContent";
import DOMPurify from "dompurify";

const SYSTEM_PAGES = [
  { key: "terms-of-service", label: "Terms of Service", icon: "📜" },
  { key: "privacy-policy", label: "Privacy Policy", icon: "🔒" },
  { key: "contact", label: "Contact Us", icon: "✉️" },
  { key: "cookie-policy", label: "Cookie Policy", icon: "🍪" },
];

// Quick insert elements
const QUICK_ELEMENTS = [
  { label: "Section", html: '<section>\n<h2 class="section-title">Section Title</h2>\n<p>Your content here...</p>\n</section>' },
  { label: "Heading 1", html: '<h1>Heading 1</h1>' },
  { label: "Heading 2", html: '<h2 class="section-title">Heading 2</h2>' },
  { label: "Heading 3", html: '<h3>Heading 3</h3>' },
  { label: "Paragraph", html: '<p>Your paragraph text here...</p>' },
  { label: "Bullet List", html: '<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li>\n</ul>' },
  { label: "Numbered List", html: '<ol>\n<li>First item</li>\n<li>Second item</li>\n<li>Third item</li>\n</ol>' },
  { label: "Quote", html: '<blockquote>Your quote here...</blockquote>' },
  { label: "Strong Text", html: '<strong>Bold text</strong>' },
  { label: "Emphasis", html: '<em>Italic text</em>' },
  { label: "Link", html: '<a href="https://example.com">Link text</a>' },
  { label: "Contact Box", html: '<div class="contact-box">\n<p><strong>Contact Name</strong></p>\n<p>Email: contact@example.com</p>\n</div>' },
  { label: "Info Box", html: '<div class="info-box">\n<p>Important information here...</p>\n</div>' },
  { label: "Warning Box", html: '<div class="warning-box">\n<p>⚠️ Warning message here...</p>\n</div>' },
  { label: "Icon + Text", html: '<span class="icon">✅</span> Your text here' },
  { label: "Grid (2 cols)", html: '<div class="grid-2">\n<div>Column 1 content</div>\n<div>Column 2 content</div>\n</div>' },
];

const PageContentEditor = () => {
  const { data: pages, isLoading, error } = useAllPages();
  const updatePage = useUpdatePage();
  const createPage = useCreatePage();
  const deletePage = useDeletePage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [activeTab, setActiveTab] = useState("content");
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    page_key: "",
    title: "",
    content: "",
    meta_title: "",
    meta_description: "",
    is_published: true,
  });

  const resetForm = () => {
    setFormData({
      page_key: "",
      title: "",
      content: "",
      meta_title: "",
      meta_description: "",
      is_published: true,
    });
    setEditingPage(null);
    setActiveTab("content");
    setPreviewMode(false);
  };

  const openEditDialog = (page: PageContent) => {
    setEditingPage(page);
    setFormData({
      page_key: page.page_key,
      title: page.title,
      content: page.content,
      meta_title: page.meta_title || "",
      meta_description: page.meta_description || "",
      is_published: page.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      return;
    }

    if (editingPage) {
      await updatePage.mutateAsync({
        id: editingPage.id,
        updates: {
          title: formData.title,
          content: formData.content,
          meta_title: formData.meta_title || null,
          meta_description: formData.meta_description || null,
          is_published: formData.is_published,
        },
      });
    } else {
      await createPage.mutateAsync({
        page_key: formData.page_key.toLowerCase().replace(/\s+/g, "-"),
        title: formData.title,
        content: formData.content,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        is_published: formData.is_published,
        last_updated: new Date().toISOString().split("T")[0],
      });
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (pageToDelete) {
      await deletePage.mutateAsync(pageToDelete);
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    }
  };

  const insertElement = (html: string) => {
    const textarea = document.getElementById("content-textarea") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newContent = before + "\n" + html + "\n" + after;
      setFormData({ ...formData, content: newContent });
      
      // Set cursor position after inserted content
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + html.length + 2, start + html.length + 2);
      }, 0);
    }
  };

  const getPageLabel = (key: string) => {
    const systemPage = SYSTEM_PAGES.find((p) => p.key === key);
    return systemPage?.label || key;
  };

  const getPageIcon = (key: string) => {
    const systemPage = SYSTEM_PAGES.find((p) => p.key === key);
    return systemPage?.icon || "📄";
  };

  const isSystemPage = (key: string) => {
    return SYSTEM_PAGES.some((p) => p.key === key);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center text-destructive">
        Error loading pages. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Page Content Editor</h2>
          <p className="text-sm text-muted-foreground">
            Edit Terms of Service, Privacy Policy, and other pages
          </p>
        </div>
        <Button
          variant="neon"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Page
        </Button>
      </div>

      {/* System Pages */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          System Pages
        </h3>
        <div className="grid gap-3">
          {pages
            ?.filter((p) => isSystemPage(p.page_key))
            .map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-xl">
                      {getPageIcon(page.page_key)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {page.title}
                        </h3>
                        <Badge
                          variant={page.is_published ? "default" : "secondary"}
                        >
                          {page.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        /{page.page_key} • Updated:{" "}
                        {page.last_updated
                          ? new Date(page.last_updated).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/${page.page_key}`, "_blank")}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="neon"
                      size="sm"
                      onClick={() => openEditDialog(page)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Custom Pages */}
      {pages?.filter((p) => !isSystemPage(p.page_key)).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Custom Pages
          </h3>
          <div className="grid gap-3">
            {pages
              ?.filter((p) => !isSystemPage(p.page_key))
              .map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {page.title}
                          </h3>
                          <Badge
                            variant={page.is_published ? "default" : "secondary"}
                          >
                            {page.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          /{page.page_key}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(page)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          setPageToDelete(page.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingPage ? (
                <>
                  <span className="text-xl">{getPageIcon(editingPage.page_key)}</span>
                  Edit: {editingPage.title}
                </>
              ) : (
                "Create New Page"
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                SEO
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="flex-1 overflow-hidden flex flex-col mt-4 space-y-4">
              {!editingPage && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Page Key (URL slug)</Label>
                    <Input
                      value={formData.page_key}
                      onChange={(e) =>
                        setFormData({ ...formData, page_key: e.target.value })
                      }
                      placeholder="my-page"
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Page Title"
                      className="bg-secondary/50"
                    />
                  </div>
                </div>
              )}

              {editingPage && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Page Title"
                    className="bg-secondary/50"
                  />
                </div>
              )}

              {/* Quick Insert Toolbar */}
              <div className="border border-border rounded-lg p-2 bg-secondary/30">
                <p className="text-xs text-muted-foreground mb-2">Quick Insert Elements:</p>
                <div className="flex flex-wrap gap-1">
                  {QUICK_ELEMENTS.slice(0, 8).map((el) => (
                    <Button
                      key={el.label}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => insertElement(el.html)}
                    >
                      {el.label}
                    </Button>
                  ))}
                  <details className="inline-block">
                    <summary className="cursor-pointer text-xs text-primary hover:underline px-2 py-1">
                      More...
                    </summary>
                    <div className="absolute z-50 mt-1 p-2 bg-popover border border-border rounded-lg shadow-lg flex flex-wrap gap-1 max-w-md">
                      {QUICK_ELEMENTS.slice(8).map((el) => (
                        <Button
                          key={el.label}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => insertElement(el.html)}
                        >
                          {el.label}
                        </Button>
                      ))}
                    </div>
                  </details>
                </div>
              </div>

              {/* Content Editor */}
              <div className="flex-1 overflow-hidden">
                <Label className="text-sm font-medium mb-2 block">
                  HTML Content
                </Label>
                <Textarea
                  id="content-textarea"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="bg-secondary/50 font-mono text-sm h-[400px] resize-none"
                  placeholder="<section>&#10;<h2>Your content here...</h2>&#10;</section>"
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-auto mt-4">
              <div className="border border-border rounded-lg p-6 bg-card min-h-[400px]">
                <h1 className="text-3xl font-bold text-foreground mb-6">
                  {formData.title || "Page Title"}
                </h1>
                <div
                  className="prose prose-invert max-w-none page-content"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(formData.content),
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Meta Title</Label>
                <Input
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_title: e.target.value })
                  }
                  placeholder="SEO title (defaults to page title)"
                  className="bg-secondary/50"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.meta_title.length}/60 characters
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Meta Description</Label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_description: e.target.value })
                  }
                  placeholder="Brief description for search engines"
                  className="bg-secondary/50 min-h-[100px]"
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.meta_description.length}/160 characters
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <Label className="text-sm font-medium">Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Make this page visible to visitors
                  </p>
                </div>
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_published: checked })
                  }
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="neon"
              onClick={handleSave}
              disabled={updatePage.isPending || createPage.isPending}
            >
              {updatePage.isPending || createPage.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingPage ? "Save Changes" : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The page will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PageContentEditor;
