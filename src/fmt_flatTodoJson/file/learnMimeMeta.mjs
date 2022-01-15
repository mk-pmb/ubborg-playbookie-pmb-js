// -*- coding: utf-8, tab-width: 2 -*-

import parseMimeType from './parseMimeType.mjs';
import decideFsAccessProps from './decideFsAccessProps.mjs';
import verifyTargetMimeType from './verifyTargetMimeType.mjs';


function learnMimeMeta(ctx) {
  const { path, popProp } = ctx;

  const replace = popProp.mustBe('undef | bool', 'replace');
  if (replace === false) {
    throw new Error("Not replacing the file isn't supported yet.");
  }

  const meta = { path, state: 'absent' };
  ctx.upd({ meta });

  const mimeType = popProp.mustBe('nul | nonEmpty str', 'mimeType');
  if (mimeType === null) { return; }

  const mimeInfo = parseMimeType(mimeType);
  if (mimeInfo.fx) { mimeInfo.fx(ctx); }
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
