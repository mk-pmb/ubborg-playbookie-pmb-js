// -*- coding: utf-8, tab-width: 2 -*-

import login from './osUserLogin.mjs';

function translate(ctx) {
  const { popProp } = ctx;
  popProp('assumeUserExists');  // Should have been handled by planner
  const m = popProp.mustBe('bool', 'member');
  if (!m) {
    throw new Error("Removing users from groups isn't supported yet.");
  }
  return { user: {
    ...login.workarounds,
    name: popProp.mustBe('nonEmpty str', 'loginName'),
    groups: [popProp.mustBe('nonEmpty str', 'grName')],
    append: true,
  } };
}

export default translate;
