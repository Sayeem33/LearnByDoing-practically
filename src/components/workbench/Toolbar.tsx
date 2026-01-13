import React from 'react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import { Circle, Square, Activity, Beaker, Zap } from 'lucide-react';

export interface ToolItem {
  id: string;
  name: string;
  type: 'ball' | 'box' | 'ramp' | 'spring' | 'pendulum' | 'chemical';
  icon: React.ReactNode;
  color: string;
  category: 'physics' | 'chemistry';
  description?: string;
}

const PHYSICS_TOOLS: ToolItem[] = [
  {
    id: 'ball',
    name: 'Ball',
    type: 'ball',
    icon: <Circle size={24} />,
    color: '#ef4444',
    category: 'physics',
    description: 'Drag to create a bouncing ball',
  },
  {
    id: 'box',
    name: 'Box',
    type: 'box',
    icon: <Square size={24} />,
    color: '#8b5cf6',
    category: 'physics',
    description: 'Drag to create a box',
  },
  {
    id: 'ramp',
    name: 'Ramp',
    type: 'ramp',
    icon: <Activity size={24} />,
    color: '#6b7280',
    category: 'physics',
    description: 'Create an inclined plane',
  },
  {
    id: 'pendulum',
    name: 'Pendulum',
    type: 'pendulum',
    icon: <Zap size={24} />,
    color: '#f59e0b',
    category: 'physics',
    description: 'Create a simple pendulum',
  },
];

const CHEMISTRY_TOOLS: ToolItem[] = [
  {
    id: 'hcl',
    name: 'HCl',
    type: 'chemical',
    icon: <Beaker size={24} />,
    color: '#ef4444',
    category: 'chemistry',
    description: 'Hydrochloric Acid',
  },
  {
    id: 'naoh',
    name: 'NaOH',
    type: 'chemical',
    icon: <Beaker size={24} />,
    color: '#3b82f6',
    category: 'chemistry',
    description: 'Sodium Hydroxide',
  },
  {
    id: 'h2o',
    name: 'H₂O',
    type: 'chemical',
    icon: <Beaker size={24} />,
    color: '#06b6d4',
    category: 'chemistry',
    description: 'Water',
  },
];

export interface ToolbarProps {
  category: 'physics' | 'chemistry';
  onToolSelect: (tool: ToolItem) => void;
  selectedTool: ToolItem | null;
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  category,
  onToolSelect,
  selectedTool,
  className,
}) => {
  const tools = category === 'physics' ? PHYSICS_TOOLS : CHEMISTRY_TOOLS;

  return (
    <Card variant="glass" padding="sm" className={cn('', className)}>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          {category === 'physics' ? 'Physics Tools' : 'Chemicals'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Click to select, then click on canvas to add
        </p>
      </div>

      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
              'hover:bg-white/50 active:scale-95',
              selectedTool?.id === tool.id
                ? 'bg-white shadow-lg ring-2 ring-primary-500'
                : 'bg-white/20'
            )}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
              style={{ backgroundColor: tool.color }}
            >
              <span className="text-white">{tool.icon}</span>
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-800">{tool.name}</div>
              {tool.description && (
                <div className="text-xs text-gray-600">{tool.description}</div>
              )}
            </div>
            {selectedTool?.id === tool.id && (
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </Card>
  );
};

export default Toolbar;