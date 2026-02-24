import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { User } from 'lucide-react';

interface ProfileSetupModalProps {
  onComplete: () => void;
}

export default function ProfileSetupModal({ onComplete }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      onComplete();
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-md border-border"
        style={{
          background: 'linear-gradient(135deg, oklch(0.18 0.03 240) 0%, oklch(0.16 0.025 245) 100%)',
        }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'oklch(0.62 0.18 230 / 0.15)', border: '1px solid oklch(0.62 0.18 230 / 0.3)' }}
            >
              <User size={20} style={{ color: 'oklch(0.62 0.18 230)' }} />
            </div>
            <DialogTitle className="font-display text-xl tracking-wide">Welcome to FlightLog Pro</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Please enter your name to set up your pilot profile. This will be used to identify you in the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="pilot-name" className="text-sm font-medium">
              Your Name
            </Label>
            <Input
              id="pilot-name"
              placeholder="e.g. John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="min-h-[44px] bg-input border-border"
              autoFocus
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full min-h-[44px] aviation-btn-primary"
            style={{ background: undefined }}
          >
            {saveProfile.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Set Up Profile'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
