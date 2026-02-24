import { useState } from 'react';
import { useListCategories, useAddCategory, useDeleteCategory } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ListManagerProps {
  categoryType: string;
  title: string;
  placeholder?: string;
}

export default function ListManager({ categoryType, title, placeholder }: ListManagerProps) {
  const [inputValue, setInputValue] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: items = [], isLoading } = useListCategories(categoryType);
  const addCategory = useAddCategory(categoryType);
  const deleteCategory = useDeleteCategory(categoryType);

  // Note: backend uses name as key, so "edit" = delete old + add new
  const handleAdd = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (items.some(i => i.name === trimmed)) {
      toast.error(`"${trimmed}" already exists`);
      return;
    }
    try {
      await addCategory.mutateAsync(trimmed);
      setInputValue('');
      toast.success(`Added "${trimmed}"`);
    } catch {
      toast.error('Failed to add item');
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await deleteCategory.mutateAsync(name);
      toast.success(`Deleted "${name}"`);
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const startEdit = (name: string) => {
    setEditingName(name);
    setEditValue(name);
  };

  const cancelEdit = () => {
    setEditingName(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === editingName) {
      cancelEdit();
      return;
    }
    if (items.some(i => i.name === trimmed)) {
      toast.error(`"${trimmed}" already exists`);
      return;
    }
    try {
      // Delete old, add new
      await deleteCategory.mutateAsync(editingName!);
      await addCategory.mutateAsync(trimmed);
      setEditingName(null);
      setEditValue('');
      toast.success(`Updated to "${trimmed}"`);
    } catch {
      toast.error('Failed to update item');
    }
  };

  return (
    <div className="space-y-4">
      {/* Add new item */}
      <div className="aviation-card p-4 rounded-xl">
        <p className="section-label">Add New {title.replace(/s$/, '')}</p>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={placeholder ?? `Enter ${title.toLowerCase().replace(/s$/, '')} name`}
            className="flex-1 min-h-[44px] bg-input border-border"
          />
          <Button
            onClick={handleAdd}
            disabled={!inputValue.trim() || addCategory.isPending}
            className="min-h-[44px] px-4 gap-2"
            style={{
              background: 'linear-gradient(135deg, oklch(0.62 0.18 230) 0%, oklch(0.55 0.2 225) 100%)',
              color: 'oklch(0.98 0.005 220)',
            }}
          >
            {addCategory.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Add
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="aviation-card rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="section-label mb-0">{title}</p>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'oklch(0.62 0.18 230 / 0.15)', color: 'oklch(0.75 0.18 230)' }}
          >
            {items.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" style={{ background: 'oklch(0.22 0.04 240)' }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No {title.toLowerCase()} added yet.</p>
            <p className="text-muted-foreground text-xs mt-1">Use the form above to add your first entry.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.name} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                {editingName === item.name ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="flex-1 min-h-[36px] h-9 bg-input border-border text-sm"
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      style={{ background: 'oklch(0.62 0.18 230 / 0.15)', color: 'oklch(0.75 0.18 230)' }}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-accent"
                    >
                      <X size={14} className="text-muted-foreground" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-foreground">{item.name}</span>
                    <button
                      onClick={() => startEdit(item.name)}
                      className="p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-accent"
                      title="Edit"
                    >
                      <Pencil size={14} className="text-muted-foreground hover:text-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.name)}
                      disabled={deleteCategory.isPending}
                      className="p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
