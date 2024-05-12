// -*- coding: utf-8, tab-width: 2 -*-

import parseCliArgs from 'cli-args-parse-dashdash-2402-pmb';
import mustBe from 'typechecks-pmb/must-be';
import pEachSeries from 'p-each-series';
import readDataFile from 'read-data-file';

import makeTranslator from './init.mjs';


function genDefaultYamlHeader(cliOpt) {
  const lines = [
    '%YAML 1.1',
    '# -*- coding: UTF-8, tab-width: 4 -*-',
    '---',
    '',
    '- gather_facts: false',
    '  name: ' + (cliOpt.pbk_name || 'Unnamed Playbook'),
    '  hosts: ' + (cliOpt.pbk_hosts || 'all'),
    '  tasks:',
  ];
  console.log(lines.join('\n'));
}


async function runFromCli(...cliArgsOrig) {
  const [cliOpt, inputFilename, ...unsuppArgs] = parseCliArgs(cliArgsOrig);
  if (unsuppArgs.length) {
    throw new Error('Unsupported extra arguments after input filename.');
  }
  if (!inputFilename) { throw new Error('No input filename given.'); }
  const inputData = await readDataFile(inputFilename);
  mustBe('nonEmpty ary', 'input data from file ' + inputFilename)(inputData);
  const [metaData, ...resDescrs] = inputData;
  const translate = await makeTranslator(metaData.format);
  if (cliOpt.yaml_header) { genDefaultYamlHeader(cliOpt); }
  async function transPrint(resDescr) {
    const yaml = await translate(resDescr);
    console.log(yaml);
  }
  await pEachSeries(resDescrs, transPrint);
}


export default { runFromCli };
