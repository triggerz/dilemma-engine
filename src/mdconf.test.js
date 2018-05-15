import React from 'react';
import parse from './mdconf';

it('turns markdown into objects', () => {
  const input = `
# Some Object
 - bullet1 : value1
 - bullet2 : value2
`;

  const output = parse(input);
  expect(output).toEqual({someObject: {'bullet1': 'value1', 'bullet2': 'value2'}});
});

it('should construct arrays by special headers', () => {
  const input = `
# Choice
You go straight

# sub header 1
First time

# Choice

# sub header 2
Also first

# Choice
You go to...

..the left!


# sub header 1
Second time
`;

  const output = parse(input, ['choice']);

  expect(output).toEqual({
    choices: [
      {
        choice: 'You go straight',
        subHeader1: 'First time'
      },
      {
        choice: '',
        subHeader2: 'Also first'
      },
      {
        choice: 'You go to...\n\n..the left!',
        subHeader1: 'Second time'
      }
    ]
  });
})

it('should only use the first colon as a delimiter', () => {
  const input = `
# section
 - image: http://www.google.com/image.jpg
`;

  const output = parse(input);
  expect(output).toEqual({section: {'image': 'http://www.google.com/image.jpg'}});
})
