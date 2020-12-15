// -*- coding: utf-8, tab-width: 2 -*-

import parseMimeType from './parseMimeType';
import decideFsAccessProps from './decideFsAccessProps';
import verifyTargetMimeType from './verifyTargetMimeType';


function learnMimeMeta(ctx) {
  const { path, popProp } = ctx;

  const replace = popProp.mustBe('undef | bool', 'replace');
  if (replace === false) {
    throw new Error("Not replacing the file isn't supported yet.");
  }

  const meta = { path, state: 'absent' };
  ctx.upd({
    meta,
    createIfMissing: false,
    needPreStat: false,
  });

  const mimeType = popProp.mustBe('nul | nonEmpty str', 'mimeType');
  if (mimeType === null) { return; }

  const mimeInfo = parseMimeType(mimeType);
  ctx.upd(mimeInfo.regular && { createIfMissing: {
    name: '\t:createIfMissing',
    copy: { dest: path, content: '', force: false },
  } });

  Object.assign(meta, {
    state: mimeInfo.state,
    follow: true,
    force: false,
    ...decideFsAccessProps(popProp),
  });
  verifyTargetMimeType(ctx);
}


export default learnMimeMeta;
