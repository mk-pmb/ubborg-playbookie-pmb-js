// -*- coding: utf-8, tab-width: 2 -*-

import pbkForgetVars from '../../pbkUtil/forgetVars';

import learnMimeMeta from './learnMimeMeta';
import configureLink from './configureLink';
import makeValidationMethodPopper from './makeValidationMethodPopper';
import maybeDownloadFilesFromUrls from './maybeDownloadFilesFromUrls';
import maybeUploadLocalFiles from './maybeUploadLocalFiles';

function maybeJoin(x) { return ((x && x.join) ? x.join('') : x); }


const statVar = 'tmp';


async function translate(ctx) {
  const { popProp } = ctx;
  const path = decodeURIComponent(ctx.resId);
  const debugHints = { ...popProp.mustBe('undef | dictObj', 'debugHints') };
  const verifyHow = makeValidationMethodPopper(popProp);
  ctx.upd({
    path,
    statVar,
    debugHints,
    verifyHow,
  });
  learnMimeMeta(ctx);
  const { meta } = ctx;

  const fileContentStep = await (async function parseContent() {
    const content = maybeJoin(popProp.mustBe('undef | str | ary', 'content'));
    const external = (
      maybeUploadLocalFiles(ctx, content, meta, verifyHow)
      || maybeDownloadFilesFromUrls(ctx, content, meta, verifyHow)
    );
    if (external) { return external; }
    if (content === undefined) { return; }
    const mst = meta.state;
    if (mst === 'link') { return configureLink(ctx, content); }
    if (mst === 'file') { return { copy: { dest: path, content } }; }
  }());

  (function checkTgtMT() {
    const k = 'targetMimeType';
    const v = popProp.mustBe('undef | nonEmpty str', k);
    if (!v) { return; }
    const h = debugHints[k];
    debugHints[k] = (h ? [h, v] : v);
    if (meta.state === 'link') { return; }
    throw new Error(k + ' is valid only for links.');
  }());

  ctx.verifyHow.skipUnsuppAlgos([
    'gpgKeySummary',
  ], { ctx });
  ctx.verifyHow.expectEmpty('Unsupported validation option(s)');

  const fileSteps = [
    ctx.createIfMissing,
    (ctx.needPreStat
      && { name: '\t:preStat', stat: { path }, register: statVar }),
    { name: '\t:meta', '#': debugHints, file: meta },
    (fileContentStep && { name: '\t:content', ...fileContentStep }),
    (ctx.needPreStat && pbkForgetVars(statVar)),
  ];
  return fileSteps;
}


export default translate;
