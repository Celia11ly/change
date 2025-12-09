import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Template } from "@/constants/templates";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Users, LayoutTemplate, Wallet, History } from "lucide-react";

import { WalletTransactionList } from "@/components/WalletTransactionList";

// --- Helper Component for File Upload ---
function FileUpload({
    label,
    value,
    onUpload,
    accept = "image/*"
}: {
    label: string;
    value?: string;
    onUpload: (url: string) => void;
    accept?: string;
}) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `official/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('uploads') // Using 'uploads' bucket
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('uploads')
                .getPublicUrl(filePath);

            onUpload(data.publicUrl);
        } catch (error: any) {
            alert(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex flex-col gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-10 border-dashed border-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                >
                    {uploading ? "Uploading..." : "Click to Upload File"}
                </Button>

                {value && (
                    <div className="relative p-2 border rounded-lg bg-slate-50 flex items-center gap-3">
                        {accept.startsWith('image') ? (
                            <img src={value} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                        ) : (
                            <video src={value} className="h-16 w-24 rounded-md bg-black object-contain" />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground truncate font-mono">{value.split('/').pop()}</p>
                            <a href={value} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Sortable Table Row Component ---
function SortableRow({ template, onEdit, onDelete }: { template: Template & { sort_order?: number }, onEdit: (t: Template) => void, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: template.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <tr ref={setNodeRef} style={style} className="hover:bg-muted/50 bg-card">
            <td className="px-4 py-3 w-10">
                <button {...attributes} {...listeners} className="cursor-grab hover:text-primary">
                    <GripVertical className="size-5 text-muted-foreground" />
                </button>
            </td>
            <td className="px-4 py-3 w-20">
                <img src={template.thumbnailUrl} className="w-12 h-16 object-cover rounded bg-slate-200" />
            </td>
            <td className="px-4 py-3">
                <div className="font-bold">{template.title}</div>
                <div className="text-xs text-muted-foreground">{template.category}</div>
            </td>
            <td className="px-4 py-3">
                <div>⭐ {template.rating}</div>
                <div>❤️ {template.likes}</div>
            </td>
            <td className="px-4 py-3">
                <div className="text-xs text-muted-foreground font-mono">{template.sort_order ?? 0}</div>
            </td>
            <td className="px-4 py-3 space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(template)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(template.id)}>Delete</Button>
            </td>
        </tr>
    );
}

// --- Main Admin Page ---
export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'templates' | 'users'>('templates');

    // Templates State
    const [templates, setTemplates] = useState<(Template & { sort_order?: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);

    // Categories State
    const [categories, setCategories] = useState<{ id: string, label: string }[]>([]);
    const [newCategory, setNewCategory] = useState("");

    // Users State
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState(100);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [activeHistoryTab, setActiveHistoryTab] = useState<'recharge' | 'consumption'>('recharge');

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Loading Data ---
    const fetchTemplates = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('official_templates')
            .select('*')
            .order('sort_order', { ascending: true }) // Sort by Order
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching templates:", error);
            alert("Failed to fetch templates");
        } else {
            const mapped = data.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                thumbnailUrl: item.thumbnail_url,
                coverUrl: item.cover_url,
                videoUrl: item.video_url,
                fullPrompt: item.prompt,
                rating: item.rating,
                likes: item.likes,
                isPremium: item.is_premium,
                category: item.category,
                ratio: item.ratio,
                sort_order: item.sort_order,
                badge: item.badge as 'New' | 'Hot' | 'Pro'
            }));
            setTemplates(mapped);
        }
        setLoading(false);
    };
    const fetchCategories = async () => {
        const { data } = await supabase.from('template_categories').select('*').order('created_at');
        if (data) setCategories(data);
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setUsers(data);
        if (error) console.error(error);
        setLoadingUsers(false);
    };


    useEffect(() => {
        if (activeTab === 'templates') {
            fetchTemplates();
            fetchCategories();
        } else {
            fetchUsers();
        }
    }, [activeTab]);

    // --- Category Actions ---
    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        const { error } = await supabase.from('template_categories').insert([{ label: newCategory.trim() }]);
        if (error) {
            alert(`Failed: ${error.message}`);
        } else {
            setNewCategory("");
            fetchCategories();
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Delete this category?")) return;
        const { error } = await supabase.from('template_categories').delete().eq('id', id);
        if (error) alert(`Failed: ${error.message}`);
        else fetchCategories();
    };

    // --- Template Actions ---
    const handleSave = async () => {
        if (!editingTemplate) return;

        const isNew = !editingTemplate.id;
        const payload = {
            title: editingTemplate.title,
            description: editingTemplate.description,
            thumbnail_url: editingTemplate.thumbnailUrl,
            cover_url: editingTemplate.coverUrl,
            video_url: editingTemplate.videoUrl,
            prompt: editingTemplate.fullPrompt,
            rating: editingTemplate.rating || 5.0,
            likes: editingTemplate.likes || 0,
            is_premium: editingTemplate.isPremium || false,
            category: editingTemplate.category || "Uncategorized",
            ratio: editingTemplate.ratio,
            badge: editingTemplate.badge || null
        };

        let error;
        if (isNew) {
            const { error: insertError } = await supabase.from('official_templates').insert([payload]);
            error = insertError;
        } else {
            const { error: updateError } = await supabase.from('official_templates').update(payload).eq('id', editingTemplate.id);
            error = updateError;
        }

        if (error) {
            alert(`Save failed: ${error.message}`);
        } else {
            setIsDialogOpen(false);
            fetchTemplates();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete template?")) return;
        const { error } = await supabase.from('official_templates').delete().eq('id', id);
        if (!error) fetchTemplates();
    };

    // --- User Actions ---
    const handleTopUp = async () => {
        if (!selectedUser) return;

        const newCredits = (selectedUser.credits || 0) + topUpAmount;

        // 1. Update Profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', selectedUser.id);

        if (updateError) {
            alert("Update failed");
            return;
        }

        // 2. Log Transaction
        await supabase.from('credit_transactions').insert({
            user_id: selectedUser.id,
            amount: topUpAmount,
            type: 'admin_topup',
            description: 'Admin Top Up'
        });

        alert("Top up successful!");
        setIsTopUpOpen(false);
        fetchUsers();
    };


    // --- DnD Logic ---
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setTemplates((items) => {
                const oldIndex = items.findIndex((t) => t.id === active.id);
                const newIndex = items.findIndex((t) => t.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSaveOrder = async () => {
        const updates = templates.map((t, index) => ({
            id: t.id,
            sort_order: index
        }));

        setLoading(true);
        for (let i = 0; i < updates.length; i++) {
            await supabase.from('official_templates').update({ sort_order: i }).eq('id', updates[i].id);
        }
        setLoading(false);
        alert("Sort order saved!");
    };


    // --- UI Helpers ---
    const openEdit = (template: Template) => {
        setEditingTemplate({ ...template });
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingTemplate({
            rating: 5.0,
            likes: 0,
            isPremium: false,
            // Default to first category if available
            category: categories.length > 0 ? categories[0].label : "Cinematic"
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="flex h-screen bg-white text-slate-900 font-sans">
            {/* --- Left Sidebar Navigation --- */}
            <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col p-4 gap-4">
                <div className="flex items-center gap-2 px-2 py-4 border-b mb-2">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                        Admin
                    </span>
                </div>

                <nav className="space-y-2">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'templates' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'}`}
                    >
                        <LayoutTemplate className="size-5" />
                        Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'}`}
                    >
                        <Users className="size-5" />
                        User Management
                    </button>
                </nav>

                <div className="mt-auto border-t pt-4">
                    <p className="text-xs text-muted-foreground px-2">V2.0.0 Sidebar Layout</p>
                </div>
            </aside>

            {/* --- Main Content Area --- */}
            <main className="flex-1 overflow-auto p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {activeTab === 'templates' ? 'Template Gallery' : 'User Database'}
                    </h2>
                    {activeTab === 'templates' && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleSaveOrder} className="border-primary text-primary hover:bg-primary/10">
                                Save Sort Order
                            </Button>
                            <Button onClick={openNew}>+ Add New Template</Button>
                        </div>
                    )}
                </div>

                {/* --- TEMPLATES TAB CONTENT --- */}
                {activeTab === 'templates' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Category Management */}
                        <div className="bg-card border rounded-lg p-4 space-y-3 shadow-sm">
                            <h3 className="font-semibold text-sm text-foreground">Manage Categories</h3>
                            <div className="flex flex-wrap gap-2 items-center">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-xs font-medium border">
                                        {cat.label}
                                        {cat.label !== "Others" && (
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-muted-foreground hover:text-destructive">
                                                <X className="size-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 ml-2">
                                    <Input
                                        placeholder="New Category..."
                                        className="h-7 w-32 text-xs"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                    <Button size="sm" onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-7">
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Templates Table */}
                        {loading ? <p>Loading...</p> : (
                            <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3 w-10"></th>
                                                <th className="px-4 py-3">Image</th>
                                                <th className="px-4 py-3">Title / Category</th>
                                                <th className="px-4 py-3">Stats</th>
                                                <th className="px-4 py-3">Order</th>
                                                <th className="px-4 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-foreground">
                                            <SortableContext items={templates.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                                {templates.map(t => (
                                                    <SortableRow
                                                        key={t.id}
                                                        template={t}
                                                        onEdit={openEdit}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </tbody>
                                    </table>
                                </DndContext>
                            </div>
                        )}
                    </div>
                )
                }

                {/* --- USERS TAB CONTENT --- */}
                {
                    activeTab === 'users' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {loadingUsers ? <p>Loading users...</p> : (
                                <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3">User</th>
                                                <th className="px-4 py-3">Email</th>
                                                <th className="px-4 py-3">Credits</th>
                                                <th className="px-4 py-3">Joined Time</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-foreground">
                                            {users.map(u => (
                                                <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-4 py-4 flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-muted overflow-hidden flex-shrink-0 border">
                                                            <img
                                                                src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.email || 'User'}&background=random`}
                                                                className="w-full h-full object-cover"
                                                                alt="User Avatar"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">{u.full_name || "No Name"}</div>
                                                            <div className="text-xs text-muted-foreground font-mono">{u.id.substring(0, 8)}...</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-muted-foreground">
                                                        {u.email || <span className="text-destructive/70 italic">No Email Synced</span>}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                            {u.credits}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-muted-foreground">
                                                        <div className="flex flex-col text-xs">
                                                            <span>{new Date(u.created_at).toLocaleDateString()}</span>
                                                            <span className="text-muted-foreground/60">{new Date(u.created_at).toLocaleTimeString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right space-x-2">
                                                        <Button size="sm" variant="outline" onClick={() => { setSelectedUser(u); setIsHistoryOpen(true); }} className="hover:bg-secondary">
                                                            <History className="size-4 mr-1" /> History
                                                        </Button>
                                                        <Button size="sm" onClick={() => { setSelectedUser(u); setIsTopUpOpen(true); }}>
                                                            <Wallet className="size-4 mr-1" /> Top Up
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )
                }
            </main>

            {/* --- Edit Template Dialog --- */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate?.id ? 'Edit Template' : 'New Template'}</DialogTitle>
                    </DialogHeader>
                    {editingTemplate && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={editingTemplate.title || ""}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={editingTemplate.category || ""}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.label}>{cat.label}</option>
                                        ))}
                                        {/* Fallback if current category isn't in list */}
                                        {editingTemplate.category && !categories.find(c => c.label === editingTemplate.category) && (
                                            <option value={editingTemplate.category}>{editingTemplate.category}</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={editingTemplate.description || ""}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/10">
                                <FileUpload
                                    label="Thumbnail (Small)"
                                    value={editingTemplate.thumbnailUrl}
                                    onUpload={(url) => setEditingTemplate(prev => ({ ...prev, thumbnailUrl: url }))}
                                />
                                <FileUpload
                                    label="Cover Image (Large)"
                                    value={editingTemplate.coverUrl}
                                    onUpload={(url) => setEditingTemplate(prev => ({ ...prev, coverUrl: url }))}
                                />
                            </div>
                            <div className="border p-4 rounded-lg bg-muted/10">
                                <FileUpload
                                    label="Video File"
                                    value={editingTemplate.videoUrl}
                                    accept="video/*"
                                    onUpload={(url) => setEditingTemplate(prev => ({ ...prev, videoUrl: url }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Prompt (Internal)</Label>
                                <Textarea
                                    value={editingTemplate.fullPrompt || ""}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, fullPrompt: e.target.value })}
                                    rows={5}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Rating</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={editingTemplate.rating || 5}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, rating: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Likes</Label>
                                    <Input
                                        type="number"
                                        value={editingTemplate.likes || 0}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, likes: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isPremium"
                                        className="h-4 w-4 rounded border-gray-300"
                                        checked={editingTemplate.isPremium || false}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, isPremium: e.target.checked })}
                                    />
                                    <Label htmlFor="isPremium">Is Premium</Label>
                                </div>
                            </div>

                            {/* --- Badge Selection --- */}
                            <div className="space-y-2 pt-2 border-t mt-2">
                                <Label>Badge (Visual Label)</Label>
                                <div className="flex gap-4">
                                    {['None', 'New', 'Hot', 'Pro'].map((badge) => (
                                        <label key={badge} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="badge"
                                                value={badge === 'None' ? '' : badge}
                                                checked={(!editingTemplate.badge && badge === 'None') || editingTemplate.badge === badge}
                                                onChange={(e) => setEditingTemplate({
                                                    ...editingTemplate,
                                                    badge: e.target.value ? e.target.value as 'New' | 'Hot' | 'Pro' : undefined
                                                })}
                                                className="radio-sm"
                                            />
                                            <span className={`text-sm ${badge === 'Hot' ? 'text-red-500' : badge === 'New' ? 'text-green-500' : ''}`}>
                                                {badge}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Top Up Dialog --- */}
            <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Top Up Support for {selectedUser?.full_name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Amount to Add</Label>
                            <Input
                                type="number"
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(parseInt(e.target.value))}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">Current Credits: {selectedUser?.credits}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTopUpOpen(false)}>Cancel</Button>
                        <Button onClick={handleTopUp}>Confirm Top Up</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- History Dialog --- */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transaction History</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="flex border-b">
                                <button
                                    onClick={() => setActiveHistoryTab('recharge')}
                                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeHistoryTab === 'recharge' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                                >
                                    Recharges & Grants
                                </button>
                                <button
                                    onClick={() => setActiveHistoryTab('consumption')}
                                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeHistoryTab === 'consumption' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                                >
                                    Consumed
                                </button>
                            </div>
                            <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
                                <WalletTransactionList
                                    userId={selectedUser.id}
                                    types={activeHistoryTab === 'recharge' ? ['admin_topup', 'purchase', 'initial_grant'] : ['generation_cost']}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
