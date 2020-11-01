// -*- coding: utf-8, tab-width: 2 -*-

function translate(ctx) {
  const mustPop = ctx.popProp.mustBe;
  let tasks = [].concat(mustPop('undef | dictObj', 'task'),
    mustPop('undef | ary', 'tasks')).filter(Boolean);

  if (tasks.length > 1) {
    tasks = tasks.map(function prefixParentTaskName(task) {
      return { ...task, name: ctx.taskName + ':' + task.name };
    });
  }

  const blockExtras = mustPop('undef | dictObj', 'blockExtras');
  if (!blockExtras) { return tasks; }
  return { ...blockExtras, block: tasks };
}

export default translate;
