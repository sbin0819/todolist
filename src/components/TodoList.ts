import type { Todo } from './types';
import { createFormElement, filterHandler } from './utils';
import './todolist.css';
// import TodoStore, { State } from './todoStore';

type FilterStatus = 'all' | 'incompleted' | 'completed';

// const initialState: State = { todos: [] };
// const todoStore = new TodoStore(initialState);

// todoStore.subscribe('todos', () => {
// console.log(todoStore.getState().todos);
// });

const TodoList = (): HTMLElement => {
  const containerElement = document.createElement('div');
  containerElement.className = 'container';

  let todoList: Todo[] = [];
  let filteredTodoList = [...todoList];
  let filterStatus: FilterStatus = 'all';

  let draggedElement: HTMLElement | null = null;
  let draggedIndex: number | null = null;
  let targetElement: HTMLElement | null = null;
  let draggedTimerId: NodeJS.Timeout | null = null;
  let targetTextContent: string | null = null;
  // let draggedTextContent: string | null = null;

  const formElement = createFormElement();
  const todoListElement = document.createElement('div');
  todoListElement.className = 'todo-list';
  const bottomElement = document.createElement('div');
  bottomElement.className = 'bottom-container';
  const countElement = document.createElement('div');
  const filterButtonsElement = document.createElement('div');
  const deleteTodoListElement = document.createElement('div');
  const deleteButton = document.createElement('button');

  const render = () => {
    const layoutHelper = {
      createTodoElement: (todo: Todo): HTMLElement => {
        const todoElement = document.createElement('div');
        todoElement.id = todo.id.toString();
        todoElement.className = 'todo-item';
        todoElement.textContent = todo.text;

        if (todo.completed) {
          todoElement.classList.add('completed');
        }
        todoElement.addEventListener('click', () =>
          fn.handleTodoClick(todo, todoElement)
        );
        return todoElement;
      },
      createFilterButtonElement: (
        text: string,
        isActive: boolean,
        status: FilterStatus,
        eventHandler: () => void
      ) => {
        const buttonElement = document.createElement('button');
        buttonElement.textContent = text;
        buttonElement.classList.add('filter-button');
        buttonElement.addEventListener('click', () => {
          fn.setActiveFilterButton(buttonElement, status);
          eventHandler();
        });
        if (isActive) {
          buttonElement.classList.add('active');
        }
        return buttonElement;
      },
      updateDeleteButtonText: (deleteButton: HTMLButtonElement) => {
        deleteButton.innerText = `삭제 (${
          todoList.filter((todo) => todo.completed).length
        })`;
      },
      updateCountElement: (
        countElement: HTMLDivElement,
        filteredTodoList: Todo[]
      ) => {
        countElement.textContent = `(${filteredTodoList.length}) left items`;
      },
      updateTodoListElement: (
        todoListElement: HTMLDivElement,
        filterStatus: FilterStatus,
        todoList: Todo[]
      ) => {
        const filter = filterHandler(filterStatus);
        todoListElement.innerHTML = '';
        const filteredTodoList = todoList.filter(filter);
        const filteredTodoElements = filteredTodoList.map((todo) => {
          const element = layoutHelper.createTodoElement(todo);
          if (filterStatus === 'incompleted') {
            element.removeEventListener(
              'mousedown',
              fn.handleMouseDown(element, +element.id)
            );
            element.addEventListener(
              'mousedown',
              fn.handleMouseDown(element, +element.id)
            );
          }
          return element;
        });

        if (filterStatus !== 'all') {
          layoutHelper.updateCountElement(
            countElement,
            todoList.filter(filter)
          );
        }

        todoListElement.append(...filteredTodoElements);
      },
    };

    const fn = {
      handleMouseDown:
        (element: HTMLElement, id: number) => (event: MouseEvent) => {
          draggedElement = element.cloneNode(true) as HTMLElement;
          draggedElement.classList.add('dragging');
          draggedElement.style.position = 'absolute';
          document.body.appendChild(draggedElement);
          draggedIndex = todoList.findIndex((t) => t?.id === +id);
          event.preventDefault();
        },
      sortTodoList: (todoList: Todo[]) => {
        todoList.sort((a, b) => {
          if (a.completed && !b.completed) return 1;
          if (!a.completed && b.completed) return -1;
          if (a.completed && b.completed)
            return +b.completedAt - +a.completedAt;
          return +b.createdAt - +a.createdAt;
        });
      },
      handleTodoClick: (todo: Todo, todoElement: HTMLElement) => {
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? new Date() : null;
        todoElement.classList.toggle('completed');
        fn.sortTodoList(todoList);
        layoutHelper.updateTodoListElement(
          todoListElement,
          filterStatus,
          todoList
        );
        layoutHelper.updateDeleteButtonText(deleteButton);
      },
      applyFilter: (filter: (todo: Todo) => boolean) => {
        const sortedFilter = todoList.sort(
          (a, b) => +a.completedAt - +b.completedAt
        );
        filteredTodoList = sortedFilter.filter(filter);
        layoutHelper.updateCountElement(countElement, filteredTodoList);
        layoutHelper.updateTodoListElement(
          todoListElement,
          filterStatus,
          todoList
        );
      },
      setActiveFilterButton: (
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
      },
      moveTodoElement: (sourceIndex: number, targetIndex: number) => {
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

        layoutHelper.updateTodoListElement(
          todoListElement,
          filterStatus,
          todoList
        );
      },
      deleteCompletedTodo: () => {
        todoList = todoList.filter((todo) => !todo.completed);
        filteredTodoList = filteredTodoList.filter((todo) => !todo.completed);
        layoutHelper.updateTodoListElement(
          todoListElement,
          filterStatus,
          todoList
        );
        layoutHelper.updateCountElement(countElement, todoList);
        layoutHelper.updateDeleteButtonText(deleteButton);
      },
    };

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

      if (draggedTimerId) {
        todoListElement.querySelectorAll('.todo-item').forEach((item) => {
          if (item?.classList.contains('preview')) {
            item.textContent = targetTextContent;
            targetTextContent = null;
            item.classList.remove('preview');
          }
        });

        clearTimeout(draggedTimerId);
      }
    };

    const registEventHandler = () => {
      deleteButton.addEventListener('click', fn.deleteCompletedTodo);

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
              if (targetElement?.classList.contains('preview')) {
                targetElement?.classList.remove('preview');
                if (draggedTimerId) {
                  clearTimeout(draggedTimerId);
                  if (targetTextContent) {
                    targetElement.textContent = targetTextContent;
                    targetTextContent = null;
                  }
                }
              }
            }

            if (target.classList.contains('todo-item')) {
              targetElement = target;
              targetElement.classList.add('drag-over');
              if (
                targetElement &&
                draggedElement?.textContent &&
                !targetElement?.classList.contains('preview')
              ) {
                draggedTimerId = setTimeout(() => {
                  targetElement?.classList.add('preview');
                  if (targetTextContent === null) {
                    // targetTextContent = targetElement?.textContent;
                    // targetElement.textContent = draggedElement?.textContent;
                  }
                }, 2000);
              }
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
              fn.moveTodoElement(draggedIndex, targetIndex);
            }
          }
        }

        draggedElement = null;
        draggedIndex = null;
        targetTextContent = null;

        if (draggedTimerId) {
          clearTimeout(draggedTimerId);
        }

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
          const todoElement = layoutHelper.createTodoElement(todo);
          todoList.unshift(todo);
          todoListElement.prepend(todoElement);
          layoutHelper.updateCountElement(countElement, todoList);
          layoutHelper.updateTodoListElement(
            todoListElement,
            filterStatus,
            todoList
          );
        }
      });
    };

    const initLayout = () => {
      filterButtonsElement.append(
        layoutHelper.createFilterButtonElement('전체', true, 'all', () => {
          fn.applyFilter(() => true);
        }),
        layoutHelper.createFilterButtonElement(
          '완료 전',
          false,
          'incompleted',
          () => {
            fn.applyFilter((todo) => !todo?.completed);
          }
        ),
        layoutHelper.createFilterButtonElement(
          '완료',
          false,
          'completed',
          () => {
            fn.applyFilter((todo) => todo.completed);
          }
        )
      );
      deleteTodoListElement.append(deleteButton);
      bottomElement.append(
        countElement,
        filterButtonsElement,
        deleteTodoListElement
      );
      layoutHelper.updateTodoListElement(
        todoListElement,
        filterStatus,
        todoList
      );
      layoutHelper.updateCountElement(countElement, filteredTodoList);
      layoutHelper.updateDeleteButtonText(deleteButton);
    };

    initLayout();
    registEventHandler();

    containerElement.append(formElement, todoListElement, bottomElement);
  };
  render();

  return containerElement;
};

export default TodoList;
