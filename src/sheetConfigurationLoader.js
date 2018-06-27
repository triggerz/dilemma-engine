import * as R from 'ramda';
import { promisify } from "es6-promisify";
import GoogleSpreadsheet from 'google-spreadsheet';

export function parseScenesFromRows(rows) {
  const headerRowIndex = 0;
  const sceneConfigHeaderMapping = {
    'dilemma': 'title',
    'situation': 'description'
  }

  const choicesHeaderMapping = {
    'answer options': 'choice',
    'feedback': 'feedback'
  }

  let sceneMap = {};

  let previousScene;
  let currentScene;

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = R.map(R.prop('value'), rows[rowIndex]);
    
    const isEmpty = R.all(R.isEmpty, row);
    if (isEmpty) {
      previousScene = currentScene;
      currentScene = undefined;
      continue;
    }

    let choiceObject = {};
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const value = row[colIndex];
      if (R.isEmpty(value)) {
        continue;
      }

      const headerValue = rows[0][colIndex].value.trim().toLowerCase();

      if (sceneConfigHeaderMapping[headerValue]) {
        if (sceneConfigHeaderMapping[headerValue] === 'title') {
          currentScene = value;
          sceneMap[currentScene] = {
            config: {
              title: value
            }
          };
        }
        sceneMap[currentScene][sceneConfigHeaderMapping[headerValue]] = value;
      } else if (choicesHeaderMapping[headerValue]) {
        if (choicesHeaderMapping[headerValue] === 'choice') {
          choiceObject = {
            variables: {}
          }
        }
        choiceObject[choicesHeaderMapping[headerValue]] = value;
      } else {
        //choiceObject.variables[headerValue] = value;
      }
    }

    sceneMap[currentScene].choices = R.append(choiceObject, sceneMap[currentScene].choices || []);
    if (previousScene) {
      sceneMap[previousScene].config.next = currentScene;
    }
  }

  return sceneMap;
}

export async function loadScenesFromSheet(sheetId) {
  const analysis = {errors: [], warnings: [], info: []};

  const doc = new GoogleSpreadsheet(sheetId);

  doc.getInfoAsync = promisify(doc.getInfo);
  const info = await doc.getInfoAsync();

  const sheet = info.worksheets[0];
  sheet.getCellsAsync = promisify(sheet.getCells);
  const cells = await sheet.getCellsAsync({ 'min-row': 1, 'max-row': 100, 'return-empty': true });

  const rows = R.values(R.groupBy(R.prop('row'), cells));
  const scenes = parseScenesFromRows(rows);
  const config = {
    title: info.title,
    initialScene: R.head(R.keys(scenes)),
    scenes
  };

  console.log(config);
  return { config, analysis };
}

