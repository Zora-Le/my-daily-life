import {
  Activity,
  Bike,
  BookOpen,
  Brain,
  Dumbbell,
  Flame,
  Footprints,
  Headphones,
  HeartPulse,
  Leaf,
  type LucideIcon,
  Mic2,
  Moon,
  Music2,
  Pencil,
  Sparkles,
  Sun,
  Target,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  headphones: Headphones,
  mic: Mic2,
  book: BookOpen,
  pencil: Pencil,
  music: Music2,
  brain: Brain,
  target: Target,
  sparkles: Sparkles,
  activity: Activity,
  dumbbell: Dumbbell,
  bike: Bike,
  footprints: Footprints,
  flame: Flame,
  heart: HeartPulse,
  leaf: Leaf,
  sun: Sun,
  moon: Moon,
};

export const lifeIconIds = Object.keys(icons);

export function LifeIcon({ id, size = 20 }: { id: string; size?: number }) {
  const Icon = icons[id] ?? Sparkles;
  return <Icon size={size} aria-hidden="true" />;
}
