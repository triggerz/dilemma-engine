import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import fs from 'fs';

configure({ adapter: new Adapter() });

global.fetch = (url) => {
  const content = fs.readFileSync(`testdata/${url}`).toString();
  return Promise.resolve({
      text: () => { return content; }
  });
}

