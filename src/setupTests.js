import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import fs from 'fs';

configure({ adapter: new Adapter() });

// Mock fetch by loading from the file system.
global.fetch = (url) => {
  let content;
  let ok = true;

  try {
    content = fs.readFileSync(`testdata/${url}`).toString();
  } catch (e) {
    ok = false;
  }

  return Promise.resolve({
    ok,
    text: () => { return content; }
  });
}

