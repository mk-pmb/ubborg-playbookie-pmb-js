// -*- coding: utf-8, tab-width: 2 -*-

import univeil from 'univeil';

const cfg = {
  conciseSingleItemContainers: false,
  yesNoBools: true,
};

function itemize(l) {
  return l.slice(1).replace(/\s+\]$/, '').replace(/(\n +)/g, '$1- ');
}

function quickDirtyYaml(x) {
  let y = univeil.jsonify(x, null, 4);
  y = y.replace(/(\n *)"(\w+)":/g, '$1$2:');
  y = y.replace(/,\n/g, '\n');

  if (cfg.conciseSingleItemContainers) {
    y = y.replace(/(\{|\[)\n +(["\w\+\-][ -\uFFFF]+)\n *(\]|\})/g,
      '$1 $2 $3¶');
  }

  // Strip object container brackets:
  y = y.replace(/\s*[\{\}]\n/g, '\n');

  if (cfg.yesNoBools) {
    y = y.replace(/: true\n/g, ': yes\n').replace(/: false\n/g, ': no\n');
  }

  // Itemize lists
  y = y.replace(/\[\n[\S\s]*?\n\s*\]/g, itemize);

  // Strip EoL spaces and left-over final bracket
  y = y.replace(/(?:\s|¶)+\n/g, '\n').replace(/\s*\}?$/, '');

  // Itemize entire record
  y = y.replace(/^\s*/g, '  - ');
  return y;
}

export default quickDirtyYaml;
