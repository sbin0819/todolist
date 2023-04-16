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
