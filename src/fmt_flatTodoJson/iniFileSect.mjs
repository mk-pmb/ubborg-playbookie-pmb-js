// -*- coding: utf-8, tab-width: 2 -*-

function translate(ctx) {
  const { popProp } = ctx;
  return { ini_file: {
    path: popProp.mustBe('nonEmpty str', 'path'),
    section: popProp.mustBe('str', 'sect'),
    state: 'absent',
    ...(popProp.mustBe('bool', 'exists') && {
      state: 'present',
    }),
  } };
}


export default translate;
