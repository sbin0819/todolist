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

const setActiveFilterButton = (activeButton: HTMLElement) => {
  const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
  filterButtons.forEach((button) => {
    if (button === activeButton) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
};

export const createFilterButtonElement = (
  text: string,
  eventHandler: () => void,
  isActive?: boolean
) => {
  const buttonElement = document.createElement('button');
  buttonElement.textContent = text;
  buttonElement.classList.add('filter-button');
  buttonElement.addEventListener('click', () => {
    setActiveFilterButton(buttonElement);
    eventHandler();
  });
  if (isActive) {
    buttonElement.classList.add('active');
  }
  return buttonElement;
};
