// -*- coding: utf-8, tab-width: 2 -*-

import univeil from 'univeil';

function itemize(l) {
  return l.slice(1).replace(/\s+\]$/, '').replace(/(\n +)/g, '$1- ');
}

function quickDirtyYaml(x) {
  return (univeil.jsonify(x, null, 4)
    .replace(/(\n *)"(\w+)":/g, '$1$2:')
    .replace(/,\n/g, '\n')
    .replace(/: true\n/g, ': yes\n')
    .replace(/: false\n/g, ': no\n')
    .replace(/(\{|\[)\n +(["\w\+\-][ -\uFFFF]+)\n *(\]|\})/g, '$1 $2 $3\u0006')
    .replace(/\s*[\{\}]\n/g, '\n')
    .replace(/\u0006/g, '')
    .replace(/\[\n[\S\s]*?\n\s*\]/g, itemize)
    .replace(/\s+\n/g, '\n')
    .replace(/^\s*/g, '  - ')
    .replace(/\s*\}$/, ''));
}

export default quickDirtyYaml;
