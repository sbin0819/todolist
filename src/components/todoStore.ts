import { Todo } from './types';

export type State = {
  todos: Todo[];
};

export type Action =
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'TOGGLE_TODO'; payload: number }
  | { type: 'DELETE_TODO'; payload: number };

export type Listener = () => void;

export default class TodoStore {
  private state: State;
  private listeners: Record<string, Listener[]>;

  constructor(initialState: State) {
    this.state = initialState;
    this.listeners = {};
  }

  getState(): State {
    return this.state;
  }

  private setState(newState: Partial<State>): void {
    this.state = {
      ...this.state,
      ...newState,
    };
    this.notify();
  }

  subscribe(key: string, listener: Listener): void {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(listener);
  }

  unsubscribe(key: string, listener: Listener): void {
    if (this.listeners[key]) {
      const index = this.listeners[key].indexOf(listener);
      if (index !== -1) {
        this.listeners[key].splice(index, 1);
      }
    }
  }

  dispatch(action: Action): void {
    switch (action.type) {
      case 'ADD_TODO': {
        this.setState({ todos: [action.payload, ...this.state.todos] });
        break;
      }
      case 'TOGGLE_TODO':
        {
          const todoIndex = this.state.todos.findIndex(
            (todo: Todo) => todo.id === action.payload
          );
          if (todoIndex !== -1) {
            const updatedTodo: Todo = {
              ...this.state.todos[todoIndex],
              completed: !this.state.todos[todoIndex].completed,
              completedAt: this.state.todos[todoIndex].completed
                ? null
                : new Date(),
            };
            const todosCopy = [...this.state.todos];
            todosCopy.splice(todoIndex, 1, updatedTodo);
            this.setState({ todos: todosCopy });
          }
        }
        break;
      case 'DELETE_TODO':
        {
          this.setState({
            todos: this.state.todos.filter(
              (todo: Todo) => todo.id !== action.payload
            ),
          });
        }
        break;
      default:
        break;
    }
  }

  private notify(): void {
    Object.values(this.listeners).forEach((listeners) =>
      listeners.forEach((listener) => listener())
    );
  }
}
