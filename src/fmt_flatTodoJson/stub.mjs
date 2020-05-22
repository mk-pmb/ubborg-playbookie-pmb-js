// -*- coding: utf-8, tab-width: 2 -*-

async function translate(ctx) {
  const msg = `stub! {${Object.keys(ctx.origDescr.props).join(', ')}}`;
  ctx.popProp = false; // eslint-disable-line no-param-reassign
  return { fail: { msg } };
}

export default translate;
