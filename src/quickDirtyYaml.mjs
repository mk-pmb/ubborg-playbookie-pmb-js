// -*- coding: utf-8, tab-width: 2 -*-

import univeil from 'univeil';


function quickDirtyYaml(x) {
  return (univeil.jsonify(x, null, 4)
    .replace(/(\{|\[)\n +(["\w\+\-][ -\uFFFF]+)\n *(\]|\})/g, '$1 $2 $3')
    .replace(/(\n *)"(\w+)":/g, '$1$2:')
    .replace(/,\n/g, '\n')
    .replace(/\s*[\{\}]\n/g, '\n')
    .replace(/\s+\n/g, '\n')
    .replace(/^\s*/g, '  - ')
    .replace(/\s*\}$/, ''));
}


export default quickDirtyYaml;
