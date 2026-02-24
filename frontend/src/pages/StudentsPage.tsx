import { useNavigate } from '@tanstack/react-router';
import ListManager from '../components/ListManager';
import { ArrowLeft, Users } from 'lucide-react';

export default function StudentsPage() {
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
          style={{ background: 'oklch(0.75 0.15 140 / 0.15)' }}
        >
          <Users size={18} style={{ color: 'oklch(0.75 0.15 140)' }} />
        </div>
        <h1 className="page-title">Students</h1>
      </div>
      <ListManager
        categoryType="student"
        title="Students"
        placeholder="Enter student name"
      />
    </div>
  );
}
