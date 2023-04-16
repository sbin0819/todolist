import './style/global.css';

import TodoList from '@components/TodoList';

export default function App() {
  const appElment = document.querySelector('#app');
  const todoListElement = TodoList();
  appElment.append(todoListElement);
}
