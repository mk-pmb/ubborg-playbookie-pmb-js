// -*- coding: utf-8, tab-width: 2 -*-

function translate(ctx) {
  let p = 'present';
  p = (ctx.popProp.mustBe('bool', p) ? p : 'absent');
  return { locale_gen: { name: ctx.resId, state: p } };
}

export default translate;
