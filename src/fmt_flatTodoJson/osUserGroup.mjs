// -*- coding: utf-8, tab-width: 2 -*-

function translate(ctx) {
  const { popProp } = ctx;
  const gr = {
    name: popProp('id'),
    state: (popProp.mustBe('bool', 'exists') ? 'present' : 'absent'),
    gid: (popProp.mustBe('pos0 fin int', 'grIdNum') || undefined),
    system: popProp.mustBe('bool', 'system', false),
  };
  return { group: gr };
}


export default translate;
