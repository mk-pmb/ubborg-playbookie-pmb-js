// -*- coding: utf-8, tab-width: 2 -*-

import mustBe from 'typechecks-pmb/must-be';


const ulfKey = 'uploadFromLocalPath';
function nope(e) { throw new Error(`prop "${ulfKey}" ${e}`); }
const latestKnownAnsibleVersion = '2.9.9';
const copyModeProps = [
  'owner',
  'group',
  // nope, try to preserve the source modes // 'mode',
];

function maybeUploadLocalFiles(ctx, content, meta, verifyHow) {
  const { resId: path, popProp } = ctx;
  let ulfPath = popProp.mustBe('undef | tru | nonEmpty str', ulfKey);
  if (!ulfPath) { return; }

  if (content !== undefined) { nope('conflicts "content"'); }
  const copyHow = { dest: path };
  if (ulfPath === true) { ulfPath = path; }
  if (!ulfPath.startsWith('/')) { nope('must be absolute, not ' + ulfPath); }
  mustBe.oneOf(['file', 'directory'],
    'Target inode type for ' + ulfKey)(meta.state);
  if (meta.state === 'directory') {
    if (!ulfPath.endsWith('/')) { ulfPath += '/'; }
    const mustMeta = mustBe.tProp('meta.', meta, 'nonEmpty str');
    copyModeProps.forEach(function cp(k) { copyHow[k] = mustMeta(k); });
    copyHow.directory_mode = copyHow.mode;
  }
  copyHow.src = ulfPath;

  verifyHow.joinHash('sha1hex', (want) => {
    const { checksum } = copyHow;
    if (checksum && (checksum !== want)) {
      throw new Error('Disagreement about which SHA-1 checksum to expect');
    }
    copyHow.checksum = want;
  });

  verifyHow.skipUnsuppAlgos([
    'sha256hex',
    'sha512hex',
  ], { ctx, blame: `ansible v${latestKnownAnsibleVersion}'s copy module` });

  if (popProp('downloadUrls')) {
    ctx.warn('Ignoring downloadUrls in favor of', ulfKey);
  }

  return { copy: copyHow };
}


export default maybeUploadLocalFiles;
