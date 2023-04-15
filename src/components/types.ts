export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export type FilterStatus = 'all' | 'incompleted' | 'completed';
