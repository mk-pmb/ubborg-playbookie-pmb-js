// -*- coding: utf-8, tab-width: 2 -*-

import is from 'typechecks-pmb';
import mustBe from 'typechecks-pmb/must-be';
import univeil from 'univeil';
import objPop from 'objpop';
import vTry from 'vtry';


function noopRes(ctx) {
  ctx.popProp = false; // eslint-disable-line no-param-reassign
  return { meta: 'noop' };
}

const simpleTypes = {
  bundle: noopRes,
  osUser: noopRes,
  stage: noopRes,
};

const typeTranslateCache = new Map();


async function lookupTypeTr(typeName) {
  let impl;
  try {
    impl = (simpleTypes[typeName]
      || (await import('./' + typeName)).default
    );
    mustBe.fun('translation function', impl);
  } catch (impErr) {
    const err = new Error('Unsupported resource type "' + typeName + '": '
      + String(impErr.message || impErr));
    throw err;
  }
  typeTranslateCache.set(typeName, impl);
  return impl;
}


function draftObjToYaml(draft, ctx) {
  return (univeil.jsonify({ name: ctx.taskName, ...draft }, null, 4)
    .replace(/(\n *)"(\w+)":/g, '$1$2:')
    .replace(/,\n/g, '\n')
    .replace(/\s*[\{\}]\n/g, '\n')
    .replace(/\s+\n/g, '\n')
    .replace(/^\s*/g, '  - ')
    .replace(/\s*\}$/, ''));
}


async function init(format) {
  switch (format.version) {
    case '200509-0700':
      break;
    default:
      throw new Error('Unsupported input format version');
  }

  const sharedCtx = {
    format,
    state: {},
  };

  async function translate(resDescr) {
    const resPop = objPop(resDescr, {
      leftoversMsg: 'Unsupported resource description properies',
    });
    const typeName = mustBe.nest('resource type', resPop('type'));
    const typeTr = (typeTranslateCache.get(typeName)
      || await lookupTypeTr(typeName));
    const resId = mustBe.nest(`ID of ${typeName} resource`, resPop('id'));
    const taskName = `${typeName}[${resId}]`;
    const popProp = objPop(resPop('props'), {
      leftoversMsg: 'Unsupported props on resource ' + taskName,
    });
    resPop.expectEmpty();
    popProp.mustBe = function poppedPropMustBe(spec, key, dflt) {
      return mustBe(spec, `Prop "${key}" of ${taskName}`,
        popProp.ifHas(key, dflt));
    };
    const ctx = {
      ...sharedCtx,
      taskName,
      origDescr: resDescr,
      popProp,
    };
    const draft = await vTry.pr(typeTr, 'Translating ' + taskName)(ctx);
    if (ctx.popProp) { ctx.popProp.expectEmpty(); }
    if (is.str(draft)) { return draft; }
    if (is.obj(draft)) { return draftObjToYaml(draft, ctx); }
    throw new Error(`Unexpected translation draft for ${taskName}: ${draft}`);
  }

  return translate;
}


export default init;
