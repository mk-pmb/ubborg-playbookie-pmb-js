// -*- coding: utf-8, tab-width: 2 -*-

import pbkForgetVars from '../pbkUtil/forgetVars';
import pbkVarSlot from '../pbkUtil/varSlot';
import parseMimeType from './file/parseMimeType';
import makeValidationMethodPopper from './file/makeValidationMethodPopper';
import maybeDownloadFilesFromUrls from './file/maybeDownloadFilesFromUrls';
import maybeUploadLocalFiles from './file/maybeUploadLocalFiles';

function maybeJoin(x) { return ((x && x.join) ? x.join('') : x); }


const statVar = 'tmp';


async function translate(ctx) {
  const { popProp } = ctx;
  const path = decodeURIComponent(ctx.resId);

  function createOrEnforce(prop, df) {
    const cr = popProp.mustBe('undef | nonEmpty str', 'created' + prop);
    const en = popProp.mustBe('undef | nonEmpty str', 'enforced' + prop);
    if (cr && (cr !== en)) {
      throw new Error(`created${prop} different from enforced${
        prop} isn't supported yet.`);
      // We'd need to construct something ourselves that would 'stat'
      // and then branch conditionally. => Postponed until required.
    }
    return (en || cr || df);
  }

  const replace = popProp.mustBe('undef | bool', 'replace');
  if (replace === false) {
    throw new Error("Not replacing the file isn't supported yet.");
  }

  const debugHints = { ...popProp.mustBe('undef | dictObj', 'debugHints') };
  let createIfMissing;
  let needPreStat = false;
  const meta = { path, state: 'absent' };
  const mimeType = popProp.mustBe('nul | nonEmpty str', 'mimeType');
  if (mimeType !== null) {
    const mimeInfo = parseMimeType(mimeType);
    if (mimeInfo.regular) {
      createIfMissing = {
        name: '\t:createIfMissing',
        copy: { dest: path, content: '', force: false },
      };
    }
    Object.assign(meta, {
      state: mimeInfo.state,
      follow: true,
      force: false,
      owner: createOrEnforce('Owner'),
      group: createOrEnforce('Group'),
      mode: createOrEnforce('Modes'),
    });
  }

  const verifyHow = makeValidationMethodPopper(popProp);

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
    needPreStat = true;
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

  verifyHow.skipUnsuppAlgos([
    'gpgKeySummary',
  ], { ctx });
  verifyHow.expectEmpty('Unsupported validation option(s)');

  const fileSteps = [
    createIfMissing,
    (needPreStat && { name: '\t:preStat', stat: { path }, register: statVar }),
    { name: '\t:meta', '#': debugHints, file: meta },
    (fileContentStep && { name: '\t:content', ...fileContentStep }),
    (needPreStat && pbkForgetVars(statVar)),
  ];
  return fileSteps;
}


export default translate;
