// -*- coding: utf-8, tab-width: 2 -*-

function verifyTargetMimeType(ctx) {
  const { popProp, meta, debugHints } = ctx;
  const k = 'targetMimeType';
  const v = popProp.mustBe('undef | nonEmpty str', k);
  if (!v) { return; }
  const h = debugHints[k];
  debugHints[k] = (h ? [h, v] : v);
  if (meta.state === 'link') { return; }
  throw new Error(k + ' is valid only for links.');
}

export default verifyTargetMimeType;
