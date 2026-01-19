import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  User, Trash2, Search, ChevronLeft, ChevronRight, Ban, CheckCircle, 
  Loader2, MailCheck, Mail, RefreshCw, Download, FileText, FileCode,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminUsers } from "@/hooks/useAdminQueries";
import { AdminTableSkeleton } from "@/components/admin/AdminSkeletons";
import { queryKeys } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  role: string;
  is_suspended?: boolean;
  email_verified?: boolean;
}

type SortField = 'created_at' | 'email' | 'display_name' | 'role' | 'email_verified';
type SortDirection = 'asc' | 'desc';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [jumpToPage, setJumpToPage] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);
  const [resendingEmailUserId, setResendingEmailUserId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Sort state
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Suspension dialog state
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendingUser, setSuspendingUser] = useState<UserProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState<string>("permanent");
  const [isSuspending, setIsSuspending] = useState(false);
  
  const pageSize = 10;

  // Use React Query hook for caching
  const { data, isLoading, refetch } = useAdminUsers(page, searchQuery, pageSize);
  const users = data?.users || [];
  const totalCount = data?.totalCount || 0;

  // Sort users client-side
  const sortedUsers = useMemo(() => {
    if (!users.length) return users;
    
    return [...users].sort((a, b) => {
      let aVal: any;
      let bVal: any;
      
      switch (sortField) {
        case 'created_at':
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        case 'email':
          aVal = (a.email || '').toLowerCase();
          bVal = (b.email || '').toLowerCase();
          break;
        case 'display_name':
          aVal = (a.display_name || '').toLowerCase();
          bVal = (b.display_name || '').toLowerCase();
          break;
        case 'role':
          aVal = a.role;
          bVal = b.role;
          break;
        case 'email_verified':
          aVal = a.email_verified ? 1 : 0;
          bVal = b.email_verified ? 1 : 0;
          break;
        default:
          aVal = a.created_at;
          bVal = b.created_at;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortField, sortDirection]);

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.users(page, searchQuery) });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1" /> 
      : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  // Export functions
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('User List Export', 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Users: ${totalCount}`, 14, 36);
      
      // Prepare data
      const tableData = sortedUsers.map(user => [
        user.display_name || 'N/A',
        user.email || 'N/A',
        user.role,
        user.email_verified ? 'Yes' : 'No',
        user.is_suspended ? 'Suspended' : 'Active',
        new Date(user.created_at).toLocaleDateString()
      ]);
      
      autoTable(doc, {
        head: [['Name', 'Email', 'Role', 'Email Verified', 'Status', 'Joined']],
        body: tableData,
        startY: 42,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [99, 102, 241] },
      });
      
      doc.save(`users-export-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToXML = () => {
    setIsExporting(true);
    try {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<users>\n';
      xml += `  <metadata>\n`;
      xml += `    <exportDate>${new Date().toISOString()}</exportDate>\n`;
      xml += `    <totalCount>${totalCount}</totalCount>\n`;
      xml += `  </metadata>\n`;
      
      sortedUsers.forEach(user => {
        xml += '  <user>\n';
        xml += `    <id>${user.user_id}</id>\n`;
        xml += `    <displayName><![CDATA[${user.display_name || ''}]]></displayName>\n`;
        xml += `    <email><![CDATA[${user.email || ''}]]></email>\n`;
        xml += `    <role>${user.role}</role>\n`;
        xml += `    <emailVerified>${user.email_verified}</emailVerified>\n`;
        xml += `    <isSuspended>${user.is_suspended || false}</isSuspended>\n`;
        xml += `    <createdAt>${user.created_at}</createdAt>\n`;
        xml += '  </user>\n';
      });
      
      xml += '</users>';
      
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('XML exported successfully!');
    } catch (error) {
      console.error('Error exporting XML:', error);
      toast.error('Failed to export XML');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['Name', 'Email', 'Role', 'Email Verified', 'Status', 'Joined'];
      const rows = sortedUsers.map(user => [
        `"${(user.display_name || 'N/A').replace(/"/g, '""')}"`,
        `"${(user.email || 'N/A').replace(/"/g, '""')}"`,
        user.role,
        user.email_verified ? 'Yes' : 'No',
        user.is_suspended ? 'Suspended' : 'Active',
        new Date(user.created_at).toLocaleDateString()
      ]);
      
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await api.db.rpc('add_admin_role', {
        target_user_id: userId,
        target_role: newRole as "admin" | "moderator" | "user",
      });

      if (error) throw error;

      toast.success("User role updated");
      invalidateUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const deleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const { error } = await api.admin.deleteUser(userId);

      if (error) throw error;

      toast.success("User deleted successfully");
      setSelectedUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      invalidateUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const bulkDeleteUsers = async () => {
    if (selectedUsers.size === 0) return;
    
    setIsBulkDeleting(true);
    try {
      const { data, error } = await api.db.rpc('bulk_delete_users', {
        user_ids: Array.from(selectedUsers)
      });

      if (error) throw error;

      toast.success(`${data} users deleted successfully`);
      setSelectedUsers(new Set());
      setShowBulkDeleteDialog(false);
      invalidateUsers();
    } catch (error: any) {
      console.error("Error bulk deleting users:", error);
      toast.error(error.message || "Failed to delete users");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const openSuspendDialog = (user: UserProfile) => {
    setSuspendingUser(user);
    setSuspendReason("");
    setSuspendDuration("permanent");
    setSuspendDialogOpen(true);
  };

  const suspendUser = async () => {
    if (!suspendingUser) return;
    
    setIsSuspending(true);
    try {
      let suspendUntil: string | undefined = undefined;
      
      if (suspendDuration !== "permanent") {
        const now = new Date();
        const days = parseInt(suspendDuration);
        now.setDate(now.getDate() + days);
        suspendUntil = now.toISOString();
      }

      const { error } = await api.admin.suspendUser(
        suspendingUser.user_id,
        suspendReason || undefined,
        suspendUntil
      );

      if (error) throw error;

      toast.success(`${suspendingUser.display_name || suspendingUser.email} has been suspended`);
      setSuspendDialogOpen(false);
      invalidateUsers();
    } catch (error: any) {
      console.error("Error suspending user:", error);
      toast.error(error.message || "Failed to suspend user");
    } finally {
      setIsSuspending(false);
    }
  };

  const unsuspendUser = async (userId: string) => {
    try {
      const { error } = await api.admin.unsuspendUser(userId);

      if (error) throw error;

      toast.success("User suspension lifted");
      invalidateUsers();
    } catch (error: any) {
      console.error("Error unsuspending user:", error);
      toast.error(error.message || "Failed to unsuspend user");
    }
  };

  const manuallyVerifyEmail = async (userId: string) => {
    setVerifyingUserId(userId);
    try {
      const { error } = await api.db.update('profiles', 
        { email_verified: true },
        { user_id: userId }
      );

      if (error) throw error;

      toast.success("Email marked as verified");
      invalidateUsers();
    } catch (error: any) {
      console.error("Error verifying email:", error);
      toast.error(error.message || "Failed to verify email");
    } finally {
      setVerifyingUserId(null);
    }
  };

  const resendVerificationEmail = async (user: UserProfile) => {
    if (!user.email) {
      toast.error("User has no email address");
      return;
    }
    
    setResendingEmailUserId(user.user_id);
    try {
      const { data, error } = await api.functions.invoke<{error?: string}>('create-verification-and-send', {
        body: {
          userId: user.user_id,
          email: user.email,
          name: user.display_name || user.email.split('@')[0]
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Verification email sent to ${user.email}`);
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setResendingEmailUserId(null);
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === sortedUsers.filter(u => u.role !== 'admin').length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(sortedUsers.filter(u => u.role !== 'admin').map(u => u.user_id)));
    }
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
      setJumpToPage("");
    } else {
      toast.error(`Please enter a page number between 1 and ${totalPages}`);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const selectableUsers = sortedUsers.filter(u => u.role !== 'admin');
  const allSelected = selectableUsers.length > 0 && selectedUsers.size === selectableUsers.length;

  return (
    <div className="space-y-6">
      {/* Header with Search, Sort, Export */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Badge variant="secondary">{totalCount} users</Badge>
          
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting || users.length === 0}>
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToXML}>
                <FileCode className="w-4 h-4 mr-2" />
                Export as XML
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportToCSV}>
                <FileText className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {selectedUsers.size > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedUsers.size} selected
            </Button>
          )}
        </div>

        {/* Sort Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <div className="flex gap-1 flex-wrap">
            <Button
              variant={sortField === 'created_at' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleSort('created_at')}
              className="h-8"
            >
              Registration Date
              {getSortIcon('created_at')}
            </Button>
            <Button
              variant={sortField === 'email' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleSort('email')}
              className="h-8"
            >
              Email
              {getSortIcon('email')}
            </Button>
            <Button
              variant={sortField === 'display_name' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleSort('display_name')}
              className="h-8"
            >
              Name
              {getSortIcon('display_name')}
            </Button>
            <Button
              variant={sortField === 'role' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleSort('role')}
              className="h-8"
            >
              Role
              {getSortIcon('role')}
            </Button>
            <Button
              variant={sortField === 'email_verified' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleSort('email_verified')}
              className="h-8"
            >
              Verified
              {getSortIcon('email_verified')}
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30 border-b border-border">
              <tr>
                <th className="p-4 w-12">
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email Verified</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <AdminTableSkeleton rows={5} />
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/20">
                    <td className="p-4">
                      {user.role !== 'admin' && (
                        <Checkbox 
                          checked={selectedUsers.has(user.user_id)}
                          onCheckedChange={() => toggleSelectUser(user.user_id)}
                          aria-label={`Select ${user.display_name || user.email}`}
                        />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">
                          {user.display_name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{user.email || "N/A"}</td>
                    <td className="p-4">
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.user_id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      {user.is_suspended ? (
                        <Badge variant="destructive" className="gap-1">
                          <Ban className="w-3 h-3" /> Suspended
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 bg-green-500/20 text-green-500">
                          <CheckCircle className="w-3 h-3" /> Active
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.email_verified ? (
                          <Badge variant="secondary" className="gap-1 bg-green-500/20 text-green-500">
                            <MailCheck className="w-3 h-3" /> Verified
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="gap-1 bg-amber-500/20 text-amber-500">
                              <Mail className="w-3 h-3" /> Pending
                            </Badge>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-green-500"
                                  onClick={() => manuallyVerifyEmail(user.user_id)}
                                  disabled={verifyingUserId === user.user_id}
                                >
                                  {verifyingUserId === user.user_id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Mark as verified</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-primary"
                                  onClick={() => resendVerificationEmail(user)}
                                  disabled={resendingEmailUserId === user.user_id}
                                >
                                  {resendingEmailUserId === user.user_id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-3 h-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Resend verification email</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user.role !== 'admin' && (
                          <>
                            {user.is_suspended ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => unsuspendUser(user.user_id)}
                                className="text-green-500"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openSuspendDialog(user)}
                                className="text-amber-500"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  disabled={deletingUserId === user.user_id}
                                >
                                  {deletingUserId === user.user_id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.display_name || user.email}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive"
                                    onClick={() => deleteUser(user.user_id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({totalCount} users)
          </p>
          
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* First & Previous */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(1)}
              disabled={page === 1}
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            {/* Jump to Page */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJumpToPage()}
                placeholder="Go to..."
                className="w-24 h-9 text-center"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleJumpToPage}
                disabled={!jumpToPage}
              >
                Go
              </Button>
            </div>
            
            {/* Next & Last */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedUsers.size} Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUsers.size} users? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={bulkDeleteUsers}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend User Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspend {suspendingUser?.display_name || suspendingUser?.email} from accessing the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={suspendDuration} onValueChange={setSuspendDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Enter a reason for the suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={suspendUser}
              disabled={isSuspending}
            >
              {isSuspending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
