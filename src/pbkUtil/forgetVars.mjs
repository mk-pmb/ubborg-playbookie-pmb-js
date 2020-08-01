// -*- coding: utf-8, tab-width: 2 -*-
//
//  Pull Request #60081 "allow users to 'undefine' a variable" is still
//  work in progress as of 2020-07-31, but we can set vars to a known
//  useless content, which should be good enough in a lot of cases.

const assert = { that: true, quiet: true };


function forgetVars(varNames) {
  let vn = [].concat(varNames).filter(Boolean);
  if (!vn.length) { return false; }
  vn = vn.map(r => ({ assert, register: r }));
  vn = (vn.length > 1 ? { block: vn } : vn[0]);
  return { name: '\t:cleanupVars', ...vn };
}


export default forgetVars;
