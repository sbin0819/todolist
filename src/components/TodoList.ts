import type { Todo } from './types';
import { createFormElement, createFilterButtonElement } from './utils';
import './todolist.css';

const TodoList = (): HTMLElement => {
  const containerElement = document.createElement('div');
  containerElement.className = 'container';

  const formElement = createFormElement();

  const todoListElement = document.createElement('div');
  todoListElement.className = 'todo-list';

  const bottomElement = document.createElement('div');
  bottomElement.className = 'bottom-container';

  const countElement = document.createElement('div');
  const filterButtonsElement = document.createElement('div');
  const deleteTodoListElement = document.createElement('div');

  const todoList: Todo[] = [
    { id: 1, text: 'todo1', completed: false },
    { id: 2, text: 'todo2', completed: false },
    { id: 3, text: 'todo3', completed: false },
    { id: 4, text: 'todo4', completed: false },
    { id: 5, text: 'todo5', completed: false },
  ];
  let filteredTodoList = [...todoList];

  let draggedElementId: string | null = null;

  const createTodoElement = (todo: Todo): HTMLElement => {
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
      draggedElementId = JSON.stringify(todo.id);
      todoElement.classList.add('dragging');
    });
    todoElement.addEventListener('dragend', () => {
      todoElement.classList.remove('dragging');
    });

    return todoElement;
  };

  const updateTodoListElement = () => {
    todoListElement.innerHTML = '';
    const filteredTodoElements = filteredTodoList.map(createTodoElement);
    todoListElement.append(...filteredTodoElements);
  };
  updateTodoListElement();

  countElement.textContent = `(${filteredTodoList.length})`;

  const updateCountElement = () => {
    countElement.textContent = `(${filteredTodoList.length})`;
  };

  const applyFilter = (filter: (todo: Todo) => boolean) => {
    filteredTodoList = todoList.filter(filter);
    updateTodoListElement();
    updateCountElement();
  };

  filterButtonsElement.append(
    createFilterButtonElement(
      '전체',
      () => {
        applyFilter(() => true);
      },
      true
    ),
    createFilterButtonElement('완료 전', () => {
      applyFilter((todo) => !todo.completed);
    }),
    createFilterButtonElement('완료', () => {
      applyFilter((todo) => todo.completed);
    })
  );

  let hoverPreviewTimeout: ReturnType<typeof setTimeout> | null = null;
  let previewIndex: number | null = null;

  const showPreview = (sourceId: string, target: Element) => {
    const sourceTodo = filteredTodoList.find(
      (todo) => todo.id.toString() === sourceId
    );
    const targetTodo = filteredTodoList.find(
      (todo) => todo.id.toString() === target.id
    );

    if (sourceTodo && targetTodo) {
      const sourceIndex = filteredTodoList.indexOf(sourceTodo);
      const targetIndex = filteredTodoList.indexOf(targetTodo);

      previewIndex = targetIndex;
      filteredTodoList.splice(sourceIndex, 1);
      filteredTodoList.splice(targetIndex, 0, sourceTodo);
      updateTodoListElement();
    }
  };

  const removePreview = () => {
    if (previewIndex !== null) {
      const sourceTodo = filteredTodoList[previewIndex];
      const originalIndex = todoList.findIndex(
        (todo) => todo.id === sourceTodo.id
      );
      filteredTodoList.splice(previewIndex, 1);
      filteredTodoList.splice(originalIndex, 0, sourceTodo);
      updateTodoListElement();
      previewIndex = null;
    }
  };

  todoListElement.addEventListener('dragover', (event: DragEvent) => {
    event.preventDefault();
  });

  todoListElement.addEventListener('dragenter', (event: DragEvent) => {
    event.preventDefault();
    const target = event.target as Element;

    if (draggedElementId && target.classList.contains('todo-item')) {
      if (hoverPreviewTimeout) {
        clearTimeout(hoverPreviewTimeout);
      }

      hoverPreviewTimeout = setTimeout(() => {
        showPreview(draggedElementId, target);
      }, 2000);
    }
  });

  todoListElement.addEventListener('dragleave', (event: DragEvent) => {
    event.preventDefault();
    const target = event.target as Element;

    if (draggedElementId && target.classList.contains('todo-item')) {
      if (hoverPreviewTimeout && previewIndex !== null) {
        clearTimeout(hoverPreviewTimeout);
      }
      removePreview();
    }
  });

  todoListElement.addEventListener('drop', (event: DragEvent) => {
    event.preventDefault();
    const { dataTransfer } = event;
    const target = event.target as Element;
    const sourceTodo = JSON.parse(dataTransfer?.getData('text/plain') || '');
    const destinationTodo = filteredTodoList.find(
      ({ id }) => id === +(target?.id || '')
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

      if (hoverPreviewTimeout) {
        clearTimeout(hoverPreviewTimeout);
      }

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
      const todo = { id: todoList.length + 1, text, completed: false };
      const todoElement = createTodoElement(todo);
      todoList.unshift(todo);
      todoListElement.prepend(todoElement);
      updateCountElement();
    }
  });

  bottomElement.append(
    countElement,
    filterButtonsElement,
    deleteTodoListElement
  );
  containerElement.append(formElement, todoListElement, bottomElement);

  return containerElement;
};

export default TodoList;
