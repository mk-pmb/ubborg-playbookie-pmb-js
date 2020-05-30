// -*- coding: utf-8, tab-width: 2 -*-

function translate(ctx) {
  const { resId, popProp } = ctx;
  return { group: {
    name: resId,
    state: 'absent',
    ...(popProp.mustBe('bool', 'exists') && {
      state: 'present',
      gid: (popProp.mustBe('pos0 fin int', 'grIdNum', 0) || undefined),
      system: !popProp.mustBe('bool', 'interactive', false),
    }),
  } };
}


export default translate;
