// -*- coding: utf-8, tab-width: 2 -*-

import readDataFile from 'read-data-file';
import mustBe from 'typechecks-pmb/must-be';
import pEachSeries from 'p-each-series';

import makeTranslator from './init';


async function runFromCli(inputFilename) {
  const inputData = await readDataFile(inputFilename);
  mustBe('nonEmpty ary', 'input data from file ' + inputFilename)(inputData);
  const [metaData, ...resDescrs] = inputData;
  const translate = await makeTranslator(metaData.format);
  async function transPrint(resDescr) {
    const yaml = await translate(resDescr);
    console.log(yaml);
  }
  await pEachSeries(resDescrs, transPrint);
}


export default { runFromCli };
