import utils from '@utils/utils';

const TodoList = () => {
  const { doc, setInnerHTML } = utils();
  const testElement = doc.createElement('div');

  setInnerHTML(testElement, '<h1>안녕하세요</h1>');

  testElement.onclick = function () {
    alert('Hello World');
  };

  return testElement;
};

export default TodoList;
