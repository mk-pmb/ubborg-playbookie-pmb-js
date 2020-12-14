// -*- coding: utf-8, tab-width: 2 -*-

import pbkForgetVars from '../../pbkUtil/forgetVars';
import pbkVarSlot from '../../pbkUtil/varSlot';

import learnMimeMeta from './learnMimeMeta';
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
    debugHints,
    verifyHow,
  });
  learnMimeMeta(ctx);
  const { meta } = ctx;

  function configureLink(dest) {
    meta.src = dest;
    meta.follow = false;  // otherwise we might chown/chmod the target!

    /* === Use the force? ===
      We'd like to ignore whether the target exists yet, but we'd also
      like to not replace a potentially-important file.
      Unfortunately, ansible 2.9 conflates both of these totally different
      risk considerations into one option, so let's at least try to
      mitigate the damages.

      Situations with acceptable risk of replacing `path`:
        - When it doesn't exist yet: Hopefully no race condition.
        - When it's a symlink: We assume it was already managed by your
          config system and the old value is "backed up" somewhere in your
          config recipe git repo.
    */
    ctx.upd({ needPreStat: true });
    meta.force = pbkVarSlot(vs => vs.condList('or', [
      `not ${statVar}.stat.exists`,
      `${statVar}.stat.islnk`,
    ]));
  }

  const fileContentStep = await (async function parseContent() {
    const content = maybeJoin(popProp.mustBe('undef | str | ary', 'content'));
    const external = (
      maybeUploadLocalFiles(ctx, content, meta, verifyHow)
      || maybeDownloadFilesFromUrls(ctx, content, meta, verifyHow)
    );
    if (external) { return external; }
    if (content === undefined) { return; }
    const mst = meta.state;
    if (mst === 'link') { return configureLink(content); }
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
