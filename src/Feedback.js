import React from 'react';
import md from 'marked';

const Feedback = ({ choice }) => {
  const sections = [];
  if (choice.choice) {
    sections.push({
      id: 'choice-text',
      title: 'Your response',
      innerHtml: md(choice.choice)
    });
  }
  if (choice.feedback) {
    sections.push({
      id: 'feedback',
      title: 'Feedback',
      innerHtml: md(choice.feedback)
    });
  }
  if (choice.outcome) {
    sections.push({
      id: 'outcome',
      title: 'Outcome',
      innerHtml: md(choice.outcome)
    });
  }
  return (<div>
    {sections.map(s => (<div key={s.id}>
      <h1>{s.title}</h1>
      <div id={s.id} dangerouslySetInnerHTML={{ __html: s.innerHtml }} />
    </div>))}
  </div>);
};

export default Feedback;
