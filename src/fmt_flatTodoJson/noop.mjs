// -*- coding: utf-8, tab-width: 2 -*-

function noopRes(ctx) {
  ctx.popProp = false; // eslint-disable-line no-param-reassign
  return { meta: 'noop' };
}

export default noopRes;
