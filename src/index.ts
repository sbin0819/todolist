import utils from '@utils/utils';
import './style/global.css';

import TodoList from '@components/TodoList';

(function RootComponent() {
  const { $ } = utils();
  const appElment = $('#app');
  appElment.appendChild(TodoList());
})();
