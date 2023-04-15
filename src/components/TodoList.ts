import type { Todo } from './types';
import { createFormElement, filterHandler } from './utils';
import './todolist.css';

type FilterStatus = 'all' | 'incompleted' | 'completed';

const TodoList = (): HTMLElement => {
  let todoList: Todo[] = [
    {
      id: 1,
      text: 'todo1',
      completed: false,
      createdAt: new Date(Date.now() + 1),
      completedAt: null,
    },
    {
      id: 2,
      text: 'todo2',
      completed: false,
      createdAt: new Date(Date.now() + 2),
      completedAt: null,
    },
    {
      id: 3,
      text: 'todo3',
      completed: false,
      createdAt: new Date(Date.now() + 3),
      completedAt: null,
    },
    {
      id: 4,
      text: 'todo4',
      completed: false,
      createdAt: new Date(Date.now() + 4),
      completedAt: null,
    },
    {
      id: 5,
      text: 'todo5',
      completed: false,
      createdAt: new Date(Date.now() + 5),
      completedAt: null,
    },
  ];

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
        return +a.createdAt - +b.createdAt;
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
      const filteredTodoElements = todoList.filter(filter).map((todo) => {
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

      todoListElement.append(...filteredTodoElements);
    };
    updateTodoListElement();

    countElement.textContent = `(${filteredTodoList.length})`;

    const updateCountElement = () => {
      countElement.textContent = `(${filteredTodoList.length})`;
    };

    const applyFilter = (filter: (todo: Todo) => boolean) => {
      const sortedFilter = todoList.sort(
        (a, b) => +a.completedAt - +b.completedAt
      );
      filteredTodoList = sortedFilter.filter(filter);
      updateCountElement();
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
      eventHandler: () => void,
      isActive: boolean,
      status: FilterStatus
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
      createFilterButtonElement(
        '전체',
        () => {
          applyFilter(() => true);
        },
        true,
        'all'
      ),
      createFilterButtonElement(
        '완료 전',
        () => {
          applyFilter((todo) => !todo.completed);
        },
        false,
        'incompleted'
      ),
      createFilterButtonElement(
        '완료',
        () => {
          applyFilter((todo) => todo.completed);
        },
        false,
        'completed'
      )
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
        updateCountElement();
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
      updateCountElement();
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
