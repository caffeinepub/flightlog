import { useNavigate } from '@tanstack/react-router';
import ListManager from '../components/ListManager';
import { ArrowLeft, UserCheck } from 'lucide-react';

export default function InstructorsPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: '/' })}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-amber-400" />
          <h1 className="font-display text-xl font-bold text-foreground">Instructors</h1>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Manage your instructor roster. Instructors added here will appear in the flight log entry form.
        </p>
        <ListManager
          categoryType="instructor"
          title="Instructors"
          placeholder="Enter instructor name..."
        />
      </div>
    </div>
  );
}
