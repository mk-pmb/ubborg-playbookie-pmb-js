// -*- coding: utf-8, tab-width: 2 -*-

import pbkForgetVars from '../../pbkUtil/forgetVars';

import makeValidationMethodPopper from './makeValidationMethodPopper';
import learnMimeMeta from './learnMimeMeta';
import parseContent from './parseContent';


const statVar = 'tmp';


async function translate(ctx) {
  const { popProp } = ctx;
  const path = decodeURIComponent(ctx.resId);
  ctx.upd({
    path,
    statVar,
    debugHints: { ...popProp.mustBe('undef | dictObj', 'debugHints') },
    verifyHow: makeValidationMethodPopper(popProp),
  });
  learnMimeMeta(ctx);
  const fileContentStep = await parseContent(ctx);

  ctx.verifyHow.skipUnsuppAlgos([
    'gpgKeySummary',
  ], { ctx });
  ctx.verifyHow.expectEmpty('Unsupported validation option(s)');

  const fileSteps = [
    ctx.createIfMissing,
    (ctx.needPreStat
      && { name: '\t:preStat', stat: { path }, register: statVar }),
    { name: '\t:meta', '#': ctx.debugHints, file: ctx.meta },
    (fileContentStep && { name: '\t:content', ...fileContentStep }),
    (ctx.needPreStat && pbkForgetVars(statVar)),
  ];
  return fileSteps;
}


export default translate;
