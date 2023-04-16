import type { Todo } from './types';
import { createFormElement, filterHandler } from './utils';
import './todolist.css';

type FilterStatus = 'all' | 'incompleted' | 'completed';

const TodoList = (): HTMLElement => {
  let todoList: Todo[] = [];

  const containerElement = document.createElement('div');
  containerElement.className = 'container';

  const render = () => {
    const formElement = createFormElement();
    const todoListElement = document.createElement('div');
    todoListElement.className = 'todo-list';
    const bottomElement = document.createElement('div');
    bottomElement.className = 'bottom-container';
    const countElement = document.createElement('div');
    const filterButtonsElement = document.createElement('div');
    const deleteTodoListElement = document.createElement('div');

    let filteredTodoList = [...todoList];
    let filterStatus: FilterStatus = 'all';

    let draggedElement: HTMLElement | null = null;
    let draggedIndex: number | null = null;
    let targetElement: HTMLElement | null = null;

    const updateDeleteButtonText = () => {
      deleteButton.innerText = `삭제 (${
        todoList.filter((todo) => todo.completed).length
      })`;
    };

    const updateCountElement = (filteredTodoList: Todo[]) => {
      countElement.textContent = `(${filteredTodoList.length}) left items`;
    };

    updateCountElement(filteredTodoList);

    const handleMouseDown =
      (element: HTMLElement, id: number) => (event: MouseEvent) => {
        draggedElement = element.cloneNode(true) as HTMLElement;
        draggedElement.classList.add('dragging');
        draggedElement.style.position = 'absolute';
        document.body.appendChild(draggedElement);
        draggedIndex = todoList.findIndex((t) => t?.id === +id);
        event.preventDefault();
      };

    const sortTodoList = () => {
      todoList.sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        if (a.completed && b.completed) return +b.completedAt - +a.completedAt;
        return +b.createdAt - +a.createdAt;
      });
    };

    const handleTodoClick = (todo: Todo, todoElement: HTMLElement) => {
      todo.completed = !todo.completed;
      todo.completedAt = todo.completed ? new Date() : null;
      todoElement.classList.toggle('completed');
      sortTodoList();
      updateTodoListElement();
      updateDeleteButtonText();
    };

    const createTodoElement = (todo: Todo): HTMLElement => {
      const todoElement = document.createElement('div');

      todoElement.id = todo.id.toString();
      todoElement.className = 'todo-item';
      todoElement.textContent = todo.text;

      if (todo.completed) {
        todoElement.classList.add('completed');
      }
      todoElement.addEventListener('click', () =>
        handleTodoClick(todo, todoElement)
      );

      return todoElement;
    };

    const updateTodoListElement = () => {
      const filter = filterHandler(filterStatus);
      todoListElement.innerHTML = '';
      const filteredTodoList = todoList.filter(filter);
      const filteredTodoElements = filteredTodoList.map((todo) => {
        const element = createTodoElement(todo);
        if (filterStatus === 'incompleted') {
          element.removeEventListener(
            'mousedown',
            handleMouseDown(element, +element.id)
          );
          element.addEventListener(
            'mousedown',
            handleMouseDown(element, +element.id)
          );
        }
        return element;
      });

      if (filterStatus !== 'all') {
        updateCountElement(todoList.filter(filter));
      }

      todoListElement.append(...filteredTodoElements);
    };
    updateTodoListElement();

    const applyFilter = (filter: (todo: Todo) => boolean) => {
      const sortedFilter = todoList.sort(
        (a, b) => +a.completedAt - +b.completedAt
      );
      filteredTodoList = sortedFilter.filter(filter);
      updateCountElement(filteredTodoList);
      updateTodoListElement();
    };

    const setActiveFilterButton = (
      activeButton: HTMLElement,
      status: FilterStatus
    ) => {
      const filterButtons = Array.from(
        document.querySelectorAll('.filter-button')
      );
      filterButtons.forEach((button) => {
        if (button === activeButton) {
          button.classList.add('active');
          filterStatus = status;
        } else {
          button.classList.remove('active');
        }
      });
    };

    const createFilterButtonElement = (
      text: string,
      isActive: boolean,
      status: FilterStatus,
      eventHandler: () => void
    ) => {
      const buttonElement = document.createElement('button');
      buttonElement.textContent = text;
      buttonElement.classList.add('filter-button');
      buttonElement.addEventListener('click', () => {
        setActiveFilterButton(buttonElement, status);
        eventHandler();
      });
      if (isActive) {
        buttonElement.classList.add('active');
      }
      return buttonElement;
    };

    filterButtonsElement.append(
      createFilterButtonElement('전체', true, 'all', () => {
        applyFilter(() => true);
      }),
      createFilterButtonElement('완료 전', false, 'incompleted', () => {
        applyFilter((todo) => !todo.completed);
      }),
      createFilterButtonElement('완료', false, 'completed', () => {
        applyFilter((todo) => todo.completed);
      })
    );

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
      if (sourceIndex < targetIndex) {
        const [draggedTodo] = todoList.splice(sourceIndex, 1);
        todoList.splice(targetIndex, 0, draggedTodo);

        const [filteredDraggedTodo] = filteredTodoList.splice(sourceIndex, 1);
        filteredTodoList.splice(targetIndex, 0, filteredDraggedTodo);
      } else {
        const [draggedTodo] = todoList.splice(sourceIndex, 1);
        todoList.splice(targetIndex, 0, draggedTodo);

        const [filteredDraggedTodo] = filteredTodoList.splice(sourceIndex, 1);
        filteredTodoList.splice(targetIndex, 0, filteredDraggedTodo);
      }

      updateTodoListElement();
    };

    document.addEventListener('mousemove', (event: MouseEvent) => {
      if (draggedElement && filterStatus === 'incompleted') {
        draggedElement.style.left =
          event.pageX - draggedElement.offsetWidth / 2 - 45 + 'px';
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
      if (draggedElement && filterStatus === 'incompleted') {
        document.body.removeChild(draggedElement);

        if (targetElement) {
          const targetIndex = todoList.findIndex(
            (t) => t.id === +targetElement.id
          );
          if (draggedIndex > -1 && targetIndex !== -1) {
            moveTodoElement(draggedIndex, targetIndex);
          }
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
      if (event.key === 'Escape' && filterStatus === 'incompleted') {
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
        const todo: Todo = {
          id: todoList.length + 1,
          text,
          completed: false,
          createdAt: new Date(),
          completedAt: null,
        };
        const todoElement = createTodoElement(todo);
        todoList.unshift(todo);
        todoListElement.prepend(todoElement);
        updateCountElement(todoList);
        updateTodoListElement();
      }
    });

    document.addEventListener('stateChange', () => {
      console.log('stateChange');
    });

    const deleteCompletedTodo = () => {
      todoList = todoList.filter((todo) => !todo.completed);
      filteredTodoList = filteredTodoList.filter((todo) => !todo.completed);
      updateTodoListElement();
      updateCountElement(todoList);
      updateDeleteButtonText();
    };

    const deleteButton = document.createElement('button');
    updateDeleteButtonText();
    deleteButton.addEventListener('click', deleteCompletedTodo);
    deleteTodoListElement.append(deleteButton);

    deleteTodoListElement.append(deleteButton);
    bottomElement.append(
      countElement,
      filterButtonsElement,
      deleteTodoListElement
    );
    containerElement.append(formElement, todoListElement, bottomElement);
  };

  render();

  return containerElement;
};

export default TodoList;
