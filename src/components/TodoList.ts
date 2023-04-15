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

  let draggedElement: HTMLElement | null = null;
  let draggedIndex: number | null = null;
  let targetElement: HTMLElement | null = null;

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

    todoElement.addEventListener('mousedown', (event) => {
      draggedElement = todoElement.cloneNode(true) as HTMLElement;
      draggedElement.classList.add('dragging');
      draggedElement.style.position = 'absolute';

      document.body.appendChild(draggedElement);
      draggedIndex = filteredTodoList.findIndex((t) => t.id === todo.id);
      event.preventDefault();
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

  // let hoverPreviewTimeout: ReturnType<typeof setTimeout> | null = null;
  // let previewIndex: number | null = null;

  // const showPreview = (sourceId: string, target: Element) => {
  //   const sourceTodo = filteredTodoList.find(
  //     (todo) => todo.id.toString() === sourceId
  //   );
  //   const targetTodo = filteredTodoList.find(
  //     (todo) => todo.id.toString() === target.id
  //   );

  //   if (sourceTodo && targetTodo) {
  //     const sourceIndex = filteredTodoList.indexOf(sourceTodo);
  //     const targetIndex = filteredTodoList.indexOf(targetTodo);

  //     previewIndex = targetIndex;
  //     filteredTodoList.splice(sourceIndex, 1);
  //     filteredTodoList.splice(targetIndex, 0, sourceTodo);
  //     updateTodoListElement();
  //   }
  // };

  // const removePreview = () => {
  //   if (previewIndex !== null) {
  //     const sourceTodo = filteredTodoList[previewIndex];
  //     const originalIndex = todoList.findIndex(
  //       (todo) => todo.id === sourceTodo.id
  //     );
  //     filteredTodoList.splice(previewIndex, 1);
  //     filteredTodoList.splice(originalIndex, 0, sourceTodo);
  //     updateTodoListElement();
  //     previewIndex = null;
  //   }
  // };

  const resetDragState = () => {
    if (draggedElement) {
      document.body.removeChild(draggedElement);
      draggedElement = null;
      draggedIndex = null;
    }

    if (targetElement) {
      targetElement.classList.remove('drag-over');
      targetElement = null;
    }
  };

  const moveTodoElement = (sourceIndex: number, targetIndex: number) => {
    const [draggedTodo] = todoList.splice(sourceIndex, 1);
    todoList.splice(targetIndex, 0, draggedTodo);

    const [filteredDraggedTodo] = filteredTodoList.splice(sourceIndex, 1);
    filteredTodoList.splice(targetIndex, 0, filteredDraggedTodo);
    updateTodoListElement();
  };

  document.addEventListener('mousemove', (event: MouseEvent) => {
    if (draggedElement) {
      draggedElement.style.left =
        event.pageX - draggedElement.offsetWidth / 2 - 34 + 'px';
      draggedElement.style.top =
        event.pageY - draggedElement.offsetHeight / 2 + 'px';

      const target = event.target as HTMLElement;
      if (target && target !== targetElement) {
        if (targetElement) {
          targetElement.classList.remove('drag-over');
        }

        if (target.classList.contains('todo-item')) {
          targetElement = target;
          targetElement.classList.add('drag-over');
        } else {
          targetElement = null;
        }
      }

      const containerRect = containerElement.getBoundingClientRect();
      if (
        event.clientX < containerRect.left ||
        event.clientX > containerRect.right ||
        event.clientY < containerRect.top ||
        event.clientY > containerRect.bottom
      ) {
        resetDragState();
      }
    }
  });

  document.addEventListener('mouseup', () => {
    if (draggedElement) {
      document.body.removeChild(draggedElement);
    }

    if (draggedElement && targetElement) {
      const targetIndex = todoList.findIndex((t) => t.id === +targetElement.id);

      if (draggedIndex && targetIndex !== -1) {
        moveTodoElement(draggedIndex, targetIndex);
      }
    }

    draggedElement = null;
    draggedIndex = null;

    if (targetElement) {
      targetElement.classList.remove('drag-over');
      targetElement = null;
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      resetDragState();
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
