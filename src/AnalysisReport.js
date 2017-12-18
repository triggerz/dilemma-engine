import React, { Component } from 'react';

function ReportSection(sectionName, section, color) {
  if (section.length === 0) {
    return null;
  }

  return (
    <div key={sectionName}>
      <h2 style={{ color }}>{sectionName}</h2>
      <ul>
        {section.map((s, i) => (<li key={i}>{s.message}</li>))}
      </ul>
    </div>
  );
}

class AnalysisReport extends Component {
  render() {
    console.log(this.props.analysis);

    const sections = [
      { sectionName: 'Errors', color: 'red' },
      { sectionName: 'Warnings', color: 'yellow' },
      { sectionName: 'Info', color: '#030303' }
    ].map(({sectionName, color}) => ReportSection(sectionName, this.props.analysis[sectionName.toLowerCase()], color));

    return (
      <div className="main-container">
        <div className="main-container-buffer">
          <header>
            <h1>Analysis</h1>
          </header>
          <div style={{ backgroundColor: '#fafafa', paddingLeft: '20px', paddingRight: '20px', paddingTop: '10px', paddingBottom: '10px', marginTop: '20px' }}>
            {sections}
          </div>
        </div>
      </div>
    );
  }
}

export default AnalysisReport;
