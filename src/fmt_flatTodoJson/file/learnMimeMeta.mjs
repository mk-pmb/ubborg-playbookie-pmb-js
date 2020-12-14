// -*- coding: utf-8, tab-width: 2 -*-

import parseMimeType from './parseMimeType';


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

  Object.assign(meta, {
    state: mimeInfo.state,
    follow: true,
    force: false,
    owner: createOrEnforce('Owner'),
    group: createOrEnforce('Group'),
    mode: createOrEnforce('Modes'),
  });
}


export default learnMimeMeta;
