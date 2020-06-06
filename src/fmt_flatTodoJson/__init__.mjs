// -*- coding: utf-8, tab-width: 2 -*-

import is from 'typechecks-pmb';
import mustBe from 'typechecks-pmb/must-be';
import objPop from 'objpop';
import vTry from 'vtry';

import yamlify from '../quickDirtyYaml';


function noopRes(ctx) {
  ctx.popProp = false; // eslint-disable-line no-param-reassign
  return { meta: 'noop' };
}

const simpleTypes = {
  bundle: noopRes,
  iniFile: noopRes,
  osUser: noopRes,
  stage: noopRes,
  sudoRuleSimple: noopRes,
};

const typeTranslateCache = new Map();


async function lookupTypeTr(typeName, props) {
  let impl;
  try {
    impl = (simpleTypes[typeName]
      || (await import('./' + typeName)).default
    );
    mustBe.fun('translation function', impl);
  } catch (impErr) {
    const err = new Error('Unsupported resource type ' + typeName + '{'
      + Object.keys(props).join(',') + '}: '
      + String(impErr.message || impErr));
    throw err;
  }
  typeTranslateCache.set(typeName, impl);
  return impl;
}


function draftObjToYaml(draft, ctx) {
  const parts = [].concat(draft).filter(Boolean);
  const n = parts.length;
  if (n < 1) { throw new Error('Empty draft!'); }
  function renderPart(pt, idx) {
    let { name } = pt;
    if (!name) {
      name = '\t';
      if (n > 1) { name += `:${idx + 1}/${n}`; }
    }
    name = name.replace(/\t/g, ctx.taskName);
    return yamlify(Object.assign({ name: 'rank this prop #1' }, pt, { name }));
  }
  return parts.map(renderPart).join('\n');
}


async function wrapTypeTr(typeTr, ctx) {
  const draft = await typeTr(ctx);
  if (ctx.popProp) { ctx.popProp.expectEmpty(); }
  if (is.str(draft)) { return draft; }
  if (is.obj(draft)) { return draftObjToYaml(draft, ctx); }
  throw new Error(`Unexpected type of translation draft for ${
    ctx.taskName}: ${typeof draft} "${draft}"`);
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
    const props = resPop('props');
    const typeTr = (typeTranslateCache.get(typeName)
      || await lookupTypeTr(typeName, props));
    const resId = mustBe.nest(`ID of ${typeName} resource`, resPop('id'));
    const taskName = `${typeName}[${resId}]`;
    const popProp = objPop(props, {
      leftoversMsg: 'Unsupported props on resource ' + taskName,
    });
    resPop.expectEmpty();
    popProp.mustBe = function poppedPropMustBe(spec, key, dflt) {
      return mustBe(spec, `Prop "${key}" of ${
        taskName}`)(popProp.ifHas(key, dflt));
    };
    const ctx = {
      ...sharedCtx,
      taskName,
      resId,
      origDescr: resDescr,
      popProp,
    };
    return vTry.pr(wrapTypeTr, 'Translating ' + taskName)(typeTr, ctx);
  }

  return translate;
}


export default init;
