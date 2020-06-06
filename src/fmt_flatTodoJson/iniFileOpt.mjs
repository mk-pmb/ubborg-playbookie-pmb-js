// -*- coding: utf-8, tab-width: 2 -*-

function translate(ctx) {
  const { popProp } = ctx;
  const val = popProp.mustBe('nul | str | num | bool', 'val');
  return { ini_file: {
    path: popProp.mustBe('nonEmpty str', 'path'),
    section: popProp.mustBe('str', 'sect'),
    option: popProp.mustBe('str', 'key'),
    state: 'absent',
    ...((val !== null) && {
      state: 'present',
      no_extra_spaces: true,
      value: val,
    }),
  } };
}


export default translate;
