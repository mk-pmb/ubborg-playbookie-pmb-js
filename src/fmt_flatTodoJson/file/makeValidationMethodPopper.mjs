// -*- coding: utf-8, tab-width: 2 -*-

import mustBe from 'typechecks-pmb/must-be';
import objPop from 'objpop';


function joinHash(key, func) {
  const parts = this.mustBe('undef | nul | str | ary', key);
  const joined = (parts && parts.join && parts.join(''));
  if (joined === '') {
    throw new Error(key + ' hash must not be an empty string.');
  }
  if (func) { return (joined ? func(joined) : false); }
  return (joined || false);
}


function makeValidationMethodPopper(popProp) {
  const veri = popProp.mustBe('undef | fal | dictObj', 'verifyContent');
  const popVali = objPop((veri || false), { mustBe });
  Object.assign(popVali, {
    joinHash,
  });
  return popVali;
}


export default makeValidationMethodPopper;
