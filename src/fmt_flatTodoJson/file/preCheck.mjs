// -*- coding: utf-8, tab-width: 2 -*-

import isStr from 'is-string';
import isFun from 'is-fn';

import pbkForgetVars from '../../pbkUtil/forgetVars';

const tmpVar = 'tmp';

const EX = function preCheck(ctx) {
  let p = ctx.preCheck;
  if (isStr(p)) { p = (EX[p] || p); }
  if (isFun(p)) { p = p(ctx); }
  return (p && { name: '\t:preCheck', ...p, register: tmpVar });
};

Object.assign(EX, {
  tmpVar,
  cleanup(ctx) { return (ctx.preCheck && pbkForgetVars(tmpVar)); },
  stat(ctx) { return { stat: { path: ctx.path } }; },

  isMountedMountPoint(ctx) {
    return {
      command: { chdir: '/', argv: ['mountpoint', '--quiet', ctx.path] },
      failed_when: false,
      changed_when: false,
    };
  },
});

export default EX;
