// -*- coding: utf-8, tab-width: 2 -*-

function translate(ctx) {
  const mustPop = ctx.popProp.mustBe;
  const tasks = [].concat(mustPop('undef | dictObj', 'task'),
    mustPop('undef | ary', 'tasks')).filter(Boolean);
  const blockExtras = mustPop('undef | dictObj', 'blockExtras');
  if (!blockExtras) { return tasks; }
  return { ...blockExtras, block: tasks };
}

export default translate;
