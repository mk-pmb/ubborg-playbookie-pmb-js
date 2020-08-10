// -*- coding: utf-8, tab-width: 2 -*-

function translate(ctx) {
  const enabled = ctx.popProp.mustBe('bool', 'enabled', true);
  const task = {
    lineinfile: {
      path: '/var/lib/dpkg/arch',
      line: ctx.resId,
      insertafter: 'EOF',
      create: false,
      state: (enabled ? 'present' : 'absent'),
    },
  };
  return task;
}

export default translate;
