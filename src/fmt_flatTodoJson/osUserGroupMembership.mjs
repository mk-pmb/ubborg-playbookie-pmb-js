// -*- coding: utf-8, tab-width: 2 -*-

function translate(ctx) {
  const { popProp } = ctx;
  const m = popProp.mustBe('bool', 'member');
  if (!m) {
    throw new Error("Removing users from groups isn't supported yet.");
  }
  return { user: {
    name: popProp.mustBe('nonEmpty str', 'loginName'),
    groups: [popProp.mustBe('nonEmpty str', 'grName')],
    append: true,
  } };
}

export default translate;
