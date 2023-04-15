import './style/global.css';

import TodoList from '@components/TodoList';

(function RootComponent() {
  const appElment = document.querySelector('#app');
  const todoListElement = TodoList();
  appElment.append(todoListElement);
})();
