type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export const createTodoElement = (todo: Todo): HTMLElement => {
  const todoElement = document.createElement('div');

  todoElement.id = todo.id.toString();
  todoElement.className = 'todo-item';
  todoElement.textContent = todo.text;

  if (todo.completed) {
    todoElement.classList.add('completed');
  }
  todoElement.addEventListener('click', () => {
    todo.completed = !todo.completed;
    todoElement.classList.toggle('completed');
  });

  // add drag and drop support
  todoElement.setAttribute('draggable', 'true');
  todoElement.addEventListener('dragstart', (event: DragEvent) => {
    event.dataTransfer?.setData('text/plain', JSON.stringify(todo));
    todoElement.classList.add('dragging');
  });
  todoElement.addEventListener('dragend', () => {
    todoElement.classList.remove('dragging');
  });

  return todoElement;
};
