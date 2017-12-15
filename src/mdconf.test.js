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

it('should turn multiple headers of the same title into an array', () => {
  const input = `
# Choice
You go straight

# Feedback
That was smart

# Choice
You go to...

..the left!

# Feedback
That was unfortunate
`;

  const output = parse(input);
  expect(output).toEqual({
    choice: [
      'You go straight',
      'You go to...\n\n..the left!'
    ],
    feedback: [
      'That was smart',
      'That was unfortunate'
    ]
  });
});
