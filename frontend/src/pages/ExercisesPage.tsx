import { useNavigate } from '@tanstack/react-router';
import ListManager from '../components/ListManager';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function ExercisesPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="page-header">
        <button
          onClick={() => navigate({ to: '/' })}
          className="p-2 rounded-lg hover:bg-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-muted-foreground" />
        </button>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'oklch(0.65 0.15 280 / 0.15)' }}
        >
          <BookOpen size={18} style={{ color: 'oklch(0.65 0.15 280)' }} />
        </div>
        <h1 className="page-title">Exercises</h1>
      </div>
      <ListManager
        categoryType="exercise"
        title="Exercises"
        placeholder="Enter exercise name or number"
      />
    </div>
  );
}
