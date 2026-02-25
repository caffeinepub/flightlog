import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const isAuthenticated = !!identity;

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Please enter your name');
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: trimmed });
      toast.success('Profile saved! Welcome aboard.');
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <Dialog open={isAuthenticated} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">Welcome to Flight Log</DialogTitle>
          </div>
          <DialogDescription>
            Please enter your name to set up your pilot profile. This will be displayed throughout the app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pilot-name">Your Name</Label>
            <Input
              id="pilot-name"
              placeholder="e.g. John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-11"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saveProfile.isPending || !name.trim()}
            className="w-full h-11 font-display font-semibold"
          >
            {saveProfile.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Profile & Continue'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
