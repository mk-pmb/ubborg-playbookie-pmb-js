// -*- coding: utf-8, tab-width: 2 -*-

import makeValidationMethodPopper from './makeValidationMethodPopper';
import learnMimeMeta from './learnMimeMeta';
import parseContent from './parseContent';
import preCheck from './preCheck';


async function translate(ctx) {
  const { popProp } = ctx;
  const path = decodeURIComponent(ctx.resId);
  ctx.upd({
    path,
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
    preCheck(ctx),
    { name: '\t:meta', '#': ctx.debugHints, ...ctx.metaCond, file: ctx.meta },
    (fileContentStep && { name: '\t:content', ...fileContentStep }),
    preCheck.cleanup(ctx),
  ];
  return fileSteps;
}


export default translate;
