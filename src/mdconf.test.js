import React from 'react';
import parse from './mdconf';

it('turns markdown into objects', () => {
  const input = `
# Some Object
 - bullet1
 - bullet2
`;

  const output = parse(input);
  expect(output).toEqual({someObject: ['bullet1', 'bullet2']});
});

it('should turn multiple headers of the same title into an array', () => {
  const input = `
# Choice
You go straight

# Feedback
That was smart

# Choice
You go left

# Feedback
That was unfortunate
`;

  const output = parse(input);
  expect(output).toEqual({
    choice: [
      {
        '(text)': 'You go straight'
      },
      {
        '(text)': 'You go left'
      }
    ],
    feedback: [
      {
        '(text)': 'That was smart'
      },
      {
        '(text)': 'That was unfortunate'
      }
    ]
  });
});
