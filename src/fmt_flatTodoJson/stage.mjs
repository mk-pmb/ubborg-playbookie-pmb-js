// -*- coding: utf-8, tab-width: 2 -*-

import debPkg from './debPkg';


async function translate(ctx) {
  const { popProp } = ctx;
  popProp('param');
  const steps = [
    ...debPkg.undefer(popProp.mustBe),
  ];
  if (steps.length) { return steps; }
  return { meta: 'noop' };
}

export default translate;
