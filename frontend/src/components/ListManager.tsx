import { useState } from 'react';
import { useAddCategory, useDeleteCategory, useListCategories } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
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
} from '@/components/ui/alert-dialog';

interface ListManagerProps {
  categoryType: string;
  title: string;
  placeholder?: string;
}

export default function ListManager({ categoryType, title, placeholder }: ListManagerProps) {
  const { data: categories, isLoading } = useListCategories(categoryType);
  const addCategory = useAddCategory();
  const deleteCategory = useDeleteCategory();

  const [newItem, setNewItem] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (categories?.some(c => c.name === trimmed)) {
      toast.error('Item already exists');
      return;
    }
    try {
      await addCategory.mutateAsync({ categoryType, name: trimmed });
      setNewItem('');
      toast.success(`${trimmed} added`);
    } catch {
      toast.error('Failed to add item');
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await deleteCategory.mutateAsync({ categoryType, name });
      toast.success(`${name} deleted`);
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const handleEditStart = (name: string) => {
    setEditingName(name);
    setEditValue(name);
  };

  const handleEditSave = async () => {
    if (!editingName) return;
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === editingName) {
      setEditingName(null);
      return;
    }
    try {
      // Delete old, add new
      await deleteCategory.mutateAsync({ categoryType, name: editingName });
      await addCategory.mutateAsync({ categoryType, name: trimmed });
      setEditingName(null);
      toast.success('Item updated');
    } catch {
      toast.error('Failed to update item');
    }
  };

  const handleEditCancel = () => {
    setEditingName(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') handleEditCancel();
  };

  return (
    <div className="space-y-4">
      {/* Add new item */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Add new ${title.toLowerCase()}...`}
          className="h-11 flex-1"
        />
        <Button
          onClick={handleAdd}
          disabled={addCategory.isPending || !newItem.trim()}
          className="h-11 px-4 flex-shrink-0"
        >
          {addCategory.isPending ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span className="ml-1 hidden sm:inline">Add</span>
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))
        ) : !categories || categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No {title.toLowerCase()} added yet. Add one above.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 min-h-[48px]"
            >
              {editingName === cat.name ? (
                <>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="h-8 flex-1 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleEditSave}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-primary/20 text-primary transition-colors"
                    aria-label="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors"
                    aria-label="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-foreground">{cat.name}</span>
                  <button
                    onClick={() => handleEditStart(cat.name)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Delete ${cat.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {cat.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove "{cat.name}" from the {title.toLowerCase()} list. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(cat.name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
