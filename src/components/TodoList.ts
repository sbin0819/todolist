import './todolist.css';
import { createTodoElement } from './utils';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const TodoList = (): HTMLElement => {
  const todoListElement = document.createElement('div');
  todoListElement.className = 'todo-list';
  const countElement = document.createElement('div');

  const todoList: Todo[] = [
    { id: 1, text: 'todo1', completed: false },
    { id: 2, text: 'todo2', completed: false },
    { id: 3, text: 'todo3', completed: false },
    { id: 4, text: 'todo4', completed: false },
    { id: 5, text: 'todo5', completed: false },
  ];

  const todoElements = todoList.map((todo) => createTodoElement(todo));
  todoListElement.append(...todoElements);

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

  const bottomElement = document.createElement('div');
  const filterButtonsElement = document.createElement('div');
  bottomElement.className = 'bottom-container';

  const createFilterButtonElement = (
    text: string,
    filter: (todo: Todo) => boolean
  ) => {
    const buttonElement = document.createElement('button');
    buttonElement.textContent = text;
    buttonElement.addEventListener('click', () => {
      const filteredTodoList = todoList.filter(filter);
      const filteredTodoElements = filteredTodoList.map(createTodoElement);
      todoListElement.innerHTML = '';
      todoListElement.append(...filteredTodoElements);
      countElement.textContent = `(${filteredTodoList.length})`;
    });
    return buttonElement;
  };

  filterButtonsElement.append(
    createFilterButtonElement('전체', () => true),
    createFilterButtonElement('미완료', (todo) => !todo.completed),
    createFilterButtonElement('완료', (todo) => todo.completed)
  );

  countElement.textContent = `(${todoList.length})`;

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
    const destinationTodo = todoList.find(
      ({ id }) => id === +((event.target as Element)?.id || '')
    );
    if (destinationTodo) {
      const sourceIndex = todoList.findIndex((el) => el.id === sourceTodo.id);
      const destinationIndex = todoList.findIndex(
        (el) => el.id === destinationTodo.id
      );
      todoList.splice(sourceIndex, 1);
      todoList.splice(destinationIndex, 0, sourceTodo);
      const newTodoElements = todoList.map(createTodoElement);
      todoListElement.textContent = '';
      todoListElement.append(...newTodoElements);
    }
  });

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const input =
      formElement.querySelector<HTMLInputElement>('input[name="todo"]');
    const text = input.value.trim();
    input.value = '';
    if (text) {
      const todo = { id: todoList.length + 1, text, completed: false };
      const todoElement = createTodoElement(todo);
      todoList.unshift(todo);
      todoListElement.prepend(todoElement);
      countElement.textContent = `(${todoList.length})`;
    }
  });

  return containerElement;
};

export default TodoList;
