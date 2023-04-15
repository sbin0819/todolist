import type { Todo } from './types';
import { createTodoElement, createFormElement } from './utils';
import './todolist.css';

const TodoList = (): HTMLElement => {
  const todoListElement = document.createElement('div');
  const formElement = createFormElement();
  todoListElement.className = 'todo-list';
  const todoList: Todo[] = [
    { id: 1, text: 'todo1', completed: false },
    { id: 2, text: 'todo2', completed: false },
    { id: 3, text: 'todo3', completed: false },
    { id: 4, text: 'todo4', completed: false },
    { id: 5, text: 'todo5', completed: false },
  ];
  let filteredTodoList = [...todoList];

  const updateTodoListElement = () => {
    todoListElement.innerHTML = '';
    const filteredTodoElements = filteredTodoList.map(createTodoElement);
    todoListElement.append(...filteredTodoElements);
  };
  updateTodoListElement();

  const countElement = document.createElement('div');
  const bottomElement = document.createElement('div');
  const filterButtonsElement = document.createElement('div');
  bottomElement.className = 'bottom-container';

  countElement.textContent = `(${filteredTodoList.length})`;

  const updateCountElement = () => {
    countElement.textContent = `(${filteredTodoList.length})`;
  };

  const createFilterButtonElement = (
    text: string,
    eventHandler: () => void
  ) => {
    const buttonElement = document.createElement('button');
    buttonElement.textContent = text;
    buttonElement.addEventListener('click', eventHandler);
    return buttonElement;
  };

  const applyFilter = (filter: (todo: Todo) => boolean) => {
    filteredTodoList = todoList.filter(filter);
    updateTodoListElement();
    updateCountElement();
  };

  filterButtonsElement.append(
    createFilterButtonElement('전체', () => {
      applyFilter(() => true);
    }),
    createFilterButtonElement('미완료', () => {
      applyFilter((todo) => !todo.completed);
    }),
    createFilterButtonElement('완료', () => {
      applyFilter((todo) => todo.completed);
    })
  );

  const containerElement = document.createElement('div');
  containerElement.className = 'container';
  bottomElement.append(countElement, filterButtonsElement);

  containerElement.append(formElement, todoListElement, bottomElement);

  todoListElement.addEventListener('dragover', (event: DragEvent) => {
    event.preventDefault();
  });

  todoListElement.addEventListener('drop', (event: DragEvent) => {
    event.preventDefault();
    const { dataTransfer } = event;
    const sourceTodo = JSON.parse(dataTransfer?.getData('text/plain') || '');
    const destinationTodo = filteredTodoList.find(
      ({ id }) => id === +((event.target as Element)?.id || '')
    );
    if (destinationTodo) {
      const sourceIndex = todoList.findIndex((el) => el.id === sourceTodo.id);
      const destinationIndex = todoList.findIndex(
        (el) => el.id === destinationTodo.id
      );
      todoList.splice(sourceIndex, 1);
      todoList.splice(destinationIndex, 0, sourceTodo);

      // Update filteredTodoList as well
      const filteredSourceIndex = filteredTodoList.findIndex(
        (el) => el.id === sourceTodo.id
      );
      const filteredDestinationIndex = filteredTodoList.findIndex(
        (el) => el.id === destinationTodo.id
      );
      filteredTodoList.splice(filteredSourceIndex, 1);
      filteredTodoList.splice(filteredDestinationIndex, 0, sourceTodo);

      updateTodoListElement(); // Replace the newTodoElements-related code
    }
  });

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const input =
      formElement.querySelector<HTMLInputElement>('input[name="todo"]');
    const text = input.value.trim();
    input.value = '';
    if (text) {
      const todo = { id: filteredTodoList.length + 1, text, completed: false };
      const todoElement = createTodoElement(todo);
      filteredTodoList.unshift(todo);
      todoListElement.prepend(todoElement);
      updateCountElement();
    }
  });

  return containerElement;
};

export default TodoList;
