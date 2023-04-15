import type { FilterStatus, Todo } from './types';

export const createFormElement = (): HTMLFormElement => {
  const formElement = document.createElement('form');
  const inputElement = document.createElement('input');
  const submitButtonElement = document.createElement('button');
  formElement.className = 'todo-form';
  inputElement.className = 'todo-input';

  inputElement.type = 'text';
  inputElement.name = 'todo';
  submitButtonElement.type = 'submit';
  submitButtonElement.textContent = 'submit';
  formElement.append(inputElement, submitButtonElement);

  return formElement;
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

  return todoElement;
};

export const filterHandler = (
  status: FilterStatus
): ((todo?: Todo) => boolean) => {
  switch (status) {
    case 'all':
      return () => true;
    case 'incompleted':
      return (todo: Todo) => !todo.completed;
    case 'completed':
      return (todo: Todo) => todo.completed;
  }
};
