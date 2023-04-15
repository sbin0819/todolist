import utils from '@utils/utils';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const TodoList = (): HTMLElement => {
  const { doc } = utils();
  const todoListElement = doc.createElement('div');
  const countElement = doc.createElement('div');

  const todoList: Todo[] = [
    { id: 1, text: 'todo1', completed: false },
    { id: 2, text: 'todo2', completed: false },
    { id: 3, text: 'todo3', completed: false },
    { id: 4, text: 'todo4', completed: false },
    { id: 5, text: 'todo5', completed: false },
  ];

  const createTodoElement = (todo: Todo): HTMLElement => {
    const todoElement = doc.createElement('div');
    const spanElement = doc.createElement('span');

    todoElement.dataset.id = todo.id.toString();
    spanElement.id = todo.id.toString();

    spanElement.textContent = todo.text;
    todoElement.append(spanElement);
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

  const todoElements = todoList.map((todo) => createTodoElement(todo));
  todoListElement.append(...todoElements);

  const formElement = doc.createElement('form');
  const inputElement = doc.createElement('input');
  const submitButtonElement = doc.createElement('button');

  inputElement.type = 'text';
  inputElement.name = 'todo';
  submitButtonElement.type = 'submit';
  submitButtonElement.textContent = 'submit';

  formElement.append(inputElement, submitButtonElement);

  const filterButtonsElement = doc.createElement('div');

  const createFilterButtonElement = (
    text: string,
    filter: (todo: Todo) => boolean
  ) => {
    const buttonElement = doc.createElement('button');
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

  const containerElement = doc.createElement('div');
  containerElement.append(
    todoListElement,
    formElement,
    filterButtonsElement,
    countElement
  );

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
    const input = formElement.querySelector(
      'input[name="todo"]'
    ) as HTMLInputElement;
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
