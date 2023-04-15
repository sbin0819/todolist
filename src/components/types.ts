export type Todo = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt: Date | null;
};

export type FilterStatus = 'all' | 'incompleted' | 'completed';
