import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import fs from 'fs';
import sinon from 'sinon';
import R from 'ramda';

configure({ adapter: new Adapter() });

// Mock fetch by loading from the file system.
const fileFetch = (url, options) => {
  if (options && options.method === 'POST') {
    // For POST messages, we will just assert on the parameters that
    // fetch was called with.
    return;
  }

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

global.fetch = sinon.stub()
  .callsFake(fileFetch);

class FakeFormData {
  constructor() { this.data = {}; }
  append (key, value) { this.data[key] = value; }
  get (key) { return this.data[key]; }
}

global.FormData = FakeFormData;
