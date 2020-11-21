// -*- coding: utf-8, tab-width: 2 -*-

import mustBe from 'typechecks-pmb/must-be';
import objPop from 'objpop';

import pkgMeta from '../../../package.json';

const pkgDescr = pkgMeta.name + ' v' + pkgMeta.version;


function joinHash(key, func) {
  const parts = this.mustBe('undef | nul | str | ary', key);
  const joined = (parts && parts.join && parts.join(''));
  if (joined === '') {
    throw new Error(key + ' hash must not be an empty string.');
  }
  if (func) { return (joined ? func(joined) : false); }
  return (joined || false);
}


function skipUnsuppAlgos(algos, opt) {
  if ((!opt) && algos.algos) { return skipUnsuppAlgos(algos.algos, algos); }
  const { blame, ctx } = (opt || false);
  const vfHow = this;
  const skipped = algos.filter(algo => vfHow.joinHash(algo));
  if (!skipped.length) { return false; }
  skipped.blame = (blame || pkgDescr);
  if (ctx && ctx.warn) {
    ctx.warn('Ignoring these checksums because ' + skipped.blame
      + " doesn't support them: " + skipped.join(', '));
  }
  return skipped;
}


const hashAlgoToplistByPropName = [
  'sha512hex',
  'sha256hex',
];
function findStrongestHash() {
  const vfHow = this;
  let best = false;
  hashAlgoToplistByPropName.forEach(function canHaz(algo) {
    const hash = vfHow.joinHash(algo);
    if (!hash) { return; }
    if (best) { return; }
    best = { algo, hash };
  });
  if (!best) { return best; }
  best.colonPair = (best.algo.replace(/(\d)hex$/, '$1') + ':' + best.hash);
  return best;
}


function makeValidationMethodPopper(popProp) {
  const veri = popProp.mustBe('undef | fal | dictObj', 'verifyContent');
  const popVali = objPop(veri, { mustBe });
  Object.assign(popVali, {
    joinHash,
    findStrongestHash,
    skipUnsuppAlgos,
  });
  return popVali;
}


export default makeValidationMethodPopper;
