// -*- coding: utf-8, tab-width: 2 -*-

import is from 'typechecks-pmb';


const vs = function varSlot(x) {
  if (is.fun(x)) { return varSlot(x(varSlot)); }
  return '{{ ' + x + ' }}';
};

Object.assign(vs, {

  condList(g, l) { return ('(' + l.join(') ' + g + ' (') + ')'); },

});

export default vs;
