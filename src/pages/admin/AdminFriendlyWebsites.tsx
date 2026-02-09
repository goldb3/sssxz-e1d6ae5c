import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Trash2, 
  Save, 
  ExternalLink, 
  GripVertical,
  Settings,
  Eye,
  EyeOff,
  Globe,
  Palette,
  Maximize2,
  ArrowLeftRight,
  Smartphone,
  Timer,
  Type,
  Sparkles,
  Hash,
  FileText,
  PanelRightOpen,
  LayoutGrid,
  List,
  Play,
  Star,
  PartyPopper,
  Shuffle,
  MousePointer,
  CheckCircle,
  Tag,
  Zap,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FriendlyWebsite, WidgetSettings, defaultSettings } from "@/components/friendly-websites/types";

// Color scheme preview colors
const colorSchemePreview: Record<WidgetSettings['colorScheme'], string> = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  gradient: 'bg-gradient-to-r from-primary to-accent',
  glass: 'bg-card border border-border',
  neon: 'bg-pink-500',
  sunset: 'bg-gradient-to-r from-orange-500 to-rose-500',
  ocean: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  forest: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  midnight: 'bg-gradient-to-r from-purple-600 to-indigo-600',
  minimal: 'bg-muted border border-border',
};

// Sortable Website Card Component
const SortableWebsiteCard = ({ 
  website, 
  onToggleActive, 
  onEdit, 
  onDelete,
  onToggleFeatured 
}: { 
  website: FriendlyWebsite;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (website: FriendlyWebsite) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: website.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`${!website.is_active ? 'opacity-60' : ''} ${isDragging ? 'z-50 shadow-lg' : ''} ${website.is_featured ? 'ring-2 ring-primary/50' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
              >
                <GripVertical className="w-5 h-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Drag to reorder</p>
            </TooltipContent>
          </Tooltip>

          {website.icon_url ? (
            <img 
              src={website.icon_url} 
              alt={website.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {website.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground truncate">{website.name}</h3>
              {website.is_featured && (
                <Badge className="text-[10px] px-1.5 py-0">Featured</Badge>
              )}
              {website.is_verified && (
                <CheckCircle className="w-4 h-4 text-blue-500" />
              )}
              {website.badge_text && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{website.badge_text}</Badge>
              )}
            </div>
            <a 
              href={website.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
            >
              {website.url}
              <ExternalLink className="w-3 h-3" />
            </a>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {website.click_count > 0 && (
                <span className="flex items-center gap-1">
                  <MousePointer className="w-3 h-3" />
                  {website.click_count} clicks
                </span>
              )}
              {website.star_rating && website.star_rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {website.star_rating}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={website.is_featured ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onToggleFeatured(website.id, !website.is_featured)}
                >
                  <Star className={`w-4 h-4 ${website.is_featured ? 'fill-current' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{website.is_featured ? 'Remove from featured' : 'Mark as featured'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    checked={website.is_active}
                    onCheckedChange={(checked) => onToggleActive(website.id, checked)}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{website.is_active ? 'Disable' : 'Enable'} this website</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(website)}
                >
                  Edit
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit website details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(website.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete website</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminFriendlyWebsites = () => {
  const queryClient = useQueryClient();
  const [websites, setWebsites] = useState<FriendlyWebsite[]>([]);
  const [settings, setSettings] = useState<WidgetSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<FriendlyWebsite | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon_url: '',
    description: '',
    tagline: '',
    badge_text: '',
    badge_color: 'primary',
    star_rating: '',
    is_verified: false,
    is_featured: false,
    open_in_new_tab: true,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch websites
      const { data: websitesData, error: websitesError } = await supabase
        .from('friendly_websites')
        .select('*')
        .order('display_order', { ascending: true });

      if (websitesError) throw websitesError;
      setWebsites((websitesData || []) as FriendlyWebsite[]);

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'friendly_sites_widget')
        .maybeSingle();

      if (settingsData?.value) {
        setSettings({ ...defaultSettings, ...(settingsData.value as Partial<WidgetSettings>) });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Check if settings exist first
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .eq('key', 'friendly_sites_widget')
        .maybeSingle();

      // Convert settings to JSON-compatible format
      const settingsJson = JSON.parse(JSON.stringify(settings));

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('app_settings')
          .update({
            value: settingsJson,
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'friendly_sites_widget');

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('app_settings')
          .insert([{
            key: 'friendly_sites_widget',
            value: settingsJson,
            updated_at: new Date().toISOString(),
          }]);

        if (error) throw error;
      }

      toast.success('Settings saved successfully');
      // Invalidate both the general app_settings and the specific widget query
      queryClient.invalidateQueries({ queryKey: ['app_settings'] });
      queryClient.invalidateQueries({ queryKey: ['app_settings', 'friendly_sites_widget'] });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddWebsite = async () => {
    if (!formData.name || !formData.url) {
      toast.error('Name and URL are required');
      return;
    }

    try {
      const maxOrder = Math.max(...websites.map(w => w.display_order), -1);
      
      const { error } = await supabase
        .from('friendly_websites')
        .insert({
          name: formData.name,
          url: formData.url,
          icon_url: formData.icon_url || null,
          description: formData.description || null,
          tagline: formData.tagline || null,
          badge_text: formData.badge_text || null,
          badge_color: formData.badge_color || 'primary',
          star_rating: formData.star_rating ? parseFloat(formData.star_rating) : null,
          is_verified: formData.is_verified,
          is_featured: formData.is_featured,
          open_in_new_tab: formData.open_in_new_tab,
          display_order: maxOrder + 1,
        });

      if (error) throw error;

      toast.success('Website added successfully');
      setAddDialogOpen(false);
      resetFormData();
      fetchData();
    } catch (error) {
      console.error('Error adding website:', error);
      toast.error('Failed to add website');
    }
  };

  const handleUpdateWebsite = async () => {
    if (!editingWebsite) return;

    try {
      const { error } = await supabase
        .from('friendly_websites')
        .update({
          name: formData.name,
          url: formData.url,
          icon_url: formData.icon_url || null,
          description: formData.description || null,
          tagline: formData.tagline || null,
          badge_text: formData.badge_text || null,
          badge_color: formData.badge_color || 'primary',
          star_rating: formData.star_rating ? parseFloat(formData.star_rating) : null,
          is_verified: formData.is_verified,
          is_featured: formData.is_featured,
          open_in_new_tab: formData.open_in_new_tab,
        })
        .eq('id', editingWebsite.id);

      if (error) throw error;

      toast.success('Website updated successfully');
      setEditingWebsite(null);
      resetFormData();
      fetchData();
    } catch (error) {
      console.error('Error updating website:', error);
      toast.error('Failed to update website');
    }
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      url: '',
      icon_url: '',
      description: '',
      tagline: '',
      badge_text: '',
      badge_color: 'primary',
      star_rating: '',
      is_verified: false,
      is_featured: false,
      open_in_new_tab: true,
    });
  };

  const handleDeleteWebsite = async (id: string) => {
    if (!confirm('Are you sure you want to delete this website?')) return;

    try {
      const { error } = await supabase
        .from('friendly_websites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Website deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error('Failed to delete website');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('friendly_websites')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      toast.success(isActive ? 'Website enabled' : 'Website disabled');
      fetchData();
    } catch (error) {
      console.error('Error toggling website:', error);
      toast.error('Failed to update website');
    }
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('friendly_websites')
        .update({ is_featured: isFeatured })
        .eq('id', id);

      if (error) throw error;

      toast.success(isFeatured ? 'Website featured' : 'Website unfeatured');
      fetchData();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update website');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = websites.findIndex((w) => w.id === active.id);
      const newIndex = websites.findIndex((w) => w.id === over.id);

      const newWebsites = arrayMove(websites, oldIndex, newIndex);
      setWebsites(newWebsites);

      // Update display_order in database
      try {
        const updates = newWebsites.map((website, index) => ({
          id: website.id,
          display_order: index,
        }));

        for (const update of updates) {
          await supabase
            .from('friendly_websites')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast.success('Order updated successfully');
      } catch (error) {
        console.error('Error updating order:', error);
        toast.error('Failed to update order');
        fetchData(); // Revert on error
      }
    }
  };

  const openEditDialog = (website: FriendlyWebsite) => {
    setEditingWebsite(website);
    setFormData({
      name: website.name,
      url: website.url,
      icon_url: website.icon_url || '',
      description: website.description || '',
      tagline: website.tagline || '',
      badge_text: website.badge_text || '',
      badge_color: website.badge_color || 'primary',
      star_rating: website.star_rating?.toString() || '',
      is_verified: website.is_verified,
      is_featured: website.is_featured,
      open_in_new_tab: website.open_in_new_tab,
    });
  };

  const WebsiteFormFields = () => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input
            placeholder="Website name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>URL *</Label>
          <Input
            placeholder="https://example.com"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Icon URL (optional)</Label>
        <Input
          placeholder="https://example.com/icon.png"
          value={formData.icon_url}
          onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Tagline (optional)</Label>
        <Input
          placeholder="Short catchy tagline"
          value={formData.tagline}
          onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea
          placeholder="Brief description of the website"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Custom Badge Text</Label>
          <Input
            placeholder="Hot, Deal, Free, etc."
            value={formData.badge_text}
            onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Badge Color</Label>
          <Select
            value={formData.badge_color}
            onValueChange={(value) => setFormData({ ...formData, badge_color: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="success">Green</SelectItem>
              <SelectItem value="warning">Yellow</SelectItem>
              <SelectItem value="danger">Red</SelectItem>
              <SelectItem value="info">Blue</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Star Rating (0-5)</Label>
        <Input
          type="number"
          min="0"
          max="5"
          step="0.5"
          placeholder="4.5"
          value={formData.star_rating}
          onChange={(e) => setFormData({ ...formData, star_rating: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label>Verified</Label>
          <Switch
            checked={formData.is_verified}
            onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label>Featured</Label>
          <Switch
            checked={formData.is_featured}
            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label>New Tab</Label>
          <Switch
            checked={formData.open_in_new_tab}
            onCheckedChange={(checked) => setFormData({ ...formData, open_in_new_tab: checked })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Friendly Websites</h1>
          <p className="text-muted-foreground">Manage partner sites shown in the sidebar widget</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Website
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add a new friendly website link</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Tabs defaultValue="websites">
        <TabsList>
          <TabsTrigger value="websites">
            <Globe className="w-4 h-4 mr-2" />
            Websites
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Widget Settings
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <Zap className="w-4 h-4 mr-2" />
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="websites" className="space-y-4 mt-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </CardContent>
            </Card>
          ) : websites.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No websites yet</h3>
                <p className="text-muted-foreground mb-4">Add your first friendly website to show in the sidebar</p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Website
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={websites.map(w => w.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {websites.map((website) => (
                    <SortableWebsiteCard
                      key={website.id}
                      website={website}
                      onToggleActive={handleToggleActive}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteWebsite}
                      onToggleFeatured={handleToggleFeatured}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Widget Settings</CardTitle>
              <CardDescription>Configure how the friendly websites sidebar appears</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Widget</Label>
                  <p className="text-sm text-muted-foreground">Show the sidebar widget on the homepage</p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                />
              </div>

              <Separator />

              {/* Display Mode */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Display Mode
                </h4>

                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setSettings({ ...settings, displayMode: 'list' })}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      settings.displayMode === 'list' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                    }`}
                  >
                    <List className="w-6 h-6 mb-2" />
                    <div className="font-medium">List View</div>
                    <p className="text-xs text-muted-foreground">Traditional vertical list</p>
                  </button>

                  <button
                    onClick={() => setSettings({ ...settings, displayMode: 'carousel' })}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      settings.displayMode === 'carousel' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                    }`}
                  >
                    <Play className="w-6 h-6 mb-2" />
                    <div className="font-medium">Carousel</div>
                    <p className="text-xs text-muted-foreground">Auto-rotating slideshow</p>
                  </button>

                  <button
                    onClick={() => setSettings({ ...settings, displayMode: 'grid' })}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      settings.displayMode === 'grid' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                    }`}
                  >
                    <LayoutGrid className="w-6 h-6 mb-2" />
                    <div className="font-medium">Grid View</div>
                    <p className="text-xs text-muted-foreground">Compact icon grid</p>
                  </button>
                </div>

                {settings.displayMode === 'carousel' && (
                  <div className="grid md:grid-cols-2 gap-4 mt-4 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      <Label>Carousel Interval (seconds)</Label>
                      <Select
                        value={settings.carouselInterval.toString()}
                        onValueChange={(value) => setSettings({ ...settings, carouselInterval: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 seconds</SelectItem>
                          <SelectItem value="5">5 seconds</SelectItem>
                          <SelectItem value="7">7 seconds</SelectItem>
                          <SelectItem value="10">10 seconds</SelectItem>
                          <SelectItem value="15">15 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-Play</Label>
                      <Switch
                        checked={settings.carouselAutoPlay}
                        onCheckedChange={(checked) => setSettings({ ...settings, carouselAutoPlay: checked })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Display Behavior Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <PanelRightOpen className="w-4 h-4" />
                  Display Behavior
                </h4>

                <div className="grid gap-4">
                  {/* Open by Default */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <PanelRightOpen className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Open by Default</Label>
                        <p className="text-xs text-muted-foreground">Widget opens automatically when page loads</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.openByDefault}
                      onCheckedChange={(checked) => setSettings({ ...settings, openByDefault: checked })}
                    />
                  </div>

                  {/* Auto-Close Delay */}
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Auto-Close Delay</Label>
                        <p className="text-xs text-muted-foreground">Automatically close after specified seconds</p>
                      </div>
                    </div>
                    <Select
                      value={settings.autoCloseDelay?.toString() || 'never'}
                      onValueChange={(value) => 
                        setSettings({ ...settings, autoCloseDelay: value === 'never' ? null : parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show Website Count */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Show Website Count</Label>
                        <p className="text-xs text-muted-foreground">Display badge with number of partner sites</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.showWebsiteCount}
                      onCheckedChange={(checked) => setSettings({ ...settings, showWebsiteCount: checked })}
                    />
                  </div>

                  {/* Pulse Animation */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Pulse Animation</Label>
                        <p className="text-xs text-muted-foreground">Show pulsing dot to attract attention</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.pulseAnimation}
                      onCheckedChange={(checked) => setSettings({ ...settings, pulseAnimation: checked })}
                    />
                  </div>

                  {/* Shuffle Order */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shuffle className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Shuffle Order</Label>
                        <p className="text-xs text-muted-foreground">Randomize order on each visit (featured always first)</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.shuffleOrder}
                      onCheckedChange={(checked) => setSettings({ ...settings, shuffleOrder: checked })}
                    />
                  </div>

                  {/* Mini Bar */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Show Mini Bar</Label>
                        <p className="text-xs text-muted-foreground">Floating icon bar when widget is closed</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.showMiniBar}
                      onCheckedChange={(checked) => setSettings({ ...settings, showMiniBar: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Content Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Content
                </h4>

                <div className="grid gap-4">
                  {/* Header Text */}
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-muted-foreground" />
                      <Label>Header Text</Label>
                    </div>
                    <Input
                      value={settings.headerText}
                      onChange={(e) => setSettings({ ...settings, headerText: e.target.value })}
                      placeholder="Partner Sites"
                    />
                  </div>

                  {/* Show Descriptions */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Show Descriptions</Label>
                        <p className="text-xs text-muted-foreground">Display website descriptions in the list</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.showDescriptions}
                      onCheckedChange={(checked) => setSettings({ ...settings, showDescriptions: checked })}
                    />
                  </div>

                  {/* Footer CTA */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <Label>Footer CTA Button</Label>
                      </div>
                      <Switch
                        checked={settings.showFooterCTA}
                        onCheckedChange={(checked) => setSettings({ ...settings, showFooterCTA: checked })}
                      />
                    </div>
                    {settings.showFooterCTA && (
                      <Input
                        value={settings.footerCTAText}
                        onChange={(e) => setSettings({ ...settings, footerCTAText: e.target.value })}
                        placeholder="Explore All Partners"
                      />
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Visibility */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label>Visible to Public</Label>
                      <p className="text-xs text-muted-foreground">Show to non-logged-in users</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.visibleToPublic}
                    onCheckedChange={(checked) => setSettings({ ...settings, visibleToPublic: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label>Visible to Logged-in</Label>
                      <p className="text-xs text-muted-foreground">Show to authenticated users</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.visibleToLoggedIn}
                    onCheckedChange={(checked) => setSettings({ ...settings, visibleToLoggedIn: checked })}
                  />
                </div>
              </div>

              <Separator />

              {/* Appearance */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Color Scheme
                    </Label>
                    <Select
                      value={settings.colorScheme}
                      onValueChange={(value: WidgetSettings['colorScheme']) => 
                        setSettings({ ...settings, colorScheme: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(colorSchemePreview).map(([key, className]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${className}`} />
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Maximize2 className="w-4 h-4" />
                      Size
                    </Label>
                    <Select
                      value={settings.size}
                      onValueChange={(value: WidgetSettings['size']) => 
                        setSettings({ ...settings, size: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4" />
                      Position
                    </Label>
                    <Select
                      value={settings.position}
                      onValueChange={(value: WidgetSettings['position']) => 
                        setSettings({ ...settings, position: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Animation Type</Label>
                    <Select
                      value={settings.animationType}
                      onValueChange={(value: WidgetSettings['animationType']) => 
                        setSettings({ ...settings, animationType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="bounce">Bounce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Mobile */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label>Show on Mobile</Label>
                    <p className="text-xs text-muted-foreground">Display widget on mobile devices</p>
                  </div>
                </div>
                <Switch
                  checked={settings.showOnMobile}
                  onCheckedChange={(checked) => setSettings({ ...settings, showOnMobile: checked })}
                />
              </div>

              {/* Save Button */}
              <Button onClick={saveSettings} disabled={isSaving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Engagement Features
              </CardTitle>
              <CardDescription>Configure features that encourage clicks and traffic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Featured Website Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Featured Website Settings
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Featured Label</Label>
                    <Input
                      value={settings.featuredLabel}
                      onChange={(e) => setSettings({ ...settings, featuredLabel: e.target.value })}
                      placeholder="Featured"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Featured Style</Label>
                    <Select
                      value={settings.featuredStyle}
                      onValueChange={(value: WidgetSettings['featuredStyle']) => 
                        setSettings({ ...settings, featuredStyle: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="glow">Glowing Border</SelectItem>
                        <SelectItem value="badge">Badge Label</SelectItem>
                        <SelectItem value="animated">Pulse Animation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Click Celebration */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <PartyPopper className="w-4 h-4" />
                  Click Celebration
                </h4>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Celebrate on Click</Label>
                    <p className="text-xs text-muted-foreground">Fire animation when user clicks a partner site</p>
                  </div>
                  <Switch
                    checked={settings.celebrateOnClick}
                    onCheckedChange={(checked) => setSettings({ ...settings, celebrateOnClick: checked })}
                  />
                </div>

                {settings.celebrateOnClick && (
                  <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                    <Label>Celebration Style</Label>
                    <Select
                      value={settings.celebrationStyle}
                      onValueChange={(value: WidgetSettings['celebrationStyle']) => 
                        setSettings({ ...settings, celebrationStyle: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confetti">🎉 Confetti</SelectItem>
                        <SelectItem value="stars">⭐ Stars</SelectItem>
                        <SelectItem value="sparkles">✨ Sparkles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              {/* Visual Indicators */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Visual Indicators
                </h4>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Show Badges</Label>
                        <p className="text-xs text-muted-foreground">Display New, Popular, and custom badges</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.showBadges}
                      onCheckedChange={(checked) => setSettings({ ...settings, showBadges: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Show Star Ratings</Label>
                        <p className="text-xs text-muted-foreground">Display star ratings for websites</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.showStarRatings}
                      onCheckedChange={(checked) => setSettings({ ...settings, showStarRatings: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Show Verified Badge</Label>
                        <p className="text-xs text-muted-foreground">Show verified checkmark on trusted sites</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.showVerifiedBadge}
                      onCheckedChange={(checked) => setSettings({ ...settings, showVerifiedBadge: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Show Click Counts</Label>
                        <p className="text-xs text-muted-foreground">Display how many times each site was visited</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.showClickCounts}
                      onCheckedChange={(checked) => setSettings({ ...settings, showClickCounts: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Hover & CTA */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Call-to-Action Settings</h4>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Show Hover Preview</Label>
                    <p className="text-xs text-muted-foreground">Rich preview card on hover</p>
                  </div>
                  <Switch
                    checked={settings.showHoverPreview}
                    onCheckedChange={(checked) => setSettings({ ...settings, showHoverPreview: checked })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CTA Style</Label>
                    <Select
                      value={settings.ctaStyle}
                      onValueChange={(value: WidgetSettings['ctaStyle']) => 
                        setSettings({ ...settings, ctaStyle: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="icon">External Link Icon</SelectItem>
                        <SelectItem value="arrow">Arrow Icon</SelectItem>
                        <SelectItem value="button">Button</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {settings.ctaStyle === 'button' && (
                    <div className="space-y-2">
                      <Label>CTA Button Text</Label>
                      <Input
                        value={settings.ctaText}
                        onChange={(e) => setSettings({ ...settings, ctaText: e.target.value })}
                        placeholder="Visit"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <Button onClick={saveSettings} disabled={isSaving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Engagement Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Website Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Friendly Website</DialogTitle>
            <DialogDescription>
              Add a partner or related website to show in the sidebar widget
            </DialogDescription>
          </DialogHeader>
          <WebsiteFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddDialogOpen(false); resetFormData(); }}>Cancel</Button>
            <Button onClick={handleAddWebsite}>Add Website</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Website Dialog */}
      <Dialog open={!!editingWebsite} onOpenChange={(open) => { if (!open) { setEditingWebsite(null); resetFormData(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Website</DialogTitle>
            <DialogDescription>
              Update the website details
            </DialogDescription>
          </DialogHeader>
          <WebsiteFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingWebsite(null); resetFormData(); }}>Cancel</Button>
            <Button onClick={handleUpdateWebsite}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFriendlyWebsites;
