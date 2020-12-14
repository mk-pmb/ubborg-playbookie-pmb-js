// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import is from 'typechecks-pmb';
import mustBe from 'typechecks-pmb/must-be';
import objPop from 'objpop';
import vTry from 'vtry';
import yamlify from 'jsonbased-yamlify-pmb';

import noopRes from './noop';


const simpleTypes = {
  bundle: noopRes,
  iniFile: noopRes,
  osUser: noopRes,
  sudoRuleSimple: noopRes,
  sysFacts: noopRes,
};

const typeTranslateCache = new Map();

const contextMethods = {
  warn(...args) { console.warn('%s:', this.taskName, ...args); },
  upd(...news) { return Object.assign(this, ...news); },
};


async function lookupTypeTr(typeName, props) {
  let impl;
  try {
    impl = (getOwn(simpleTypes, typeName)
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
    if (is.str(pt)) {
      return (pt
        .replace(/\t/g, ctx.taskName)
        .replace(/(^|\n)(?= *\S)/g, '$1  ')
      );
    }
    if (!is.obj(draft)) {
      throw new Error(`Unexpected type of translation draft part for ${
        ctx.taskName}: ${typeof pt} "${pt}"`);
    }
    let { name } = pt;
    const task = { name: 'rank this prop #1', ...pt };
    if (!name) {
      name = '';
      if (n > 1) { name += `${idx + 1}/${n}`; }
    }
    if (name.includes('\t')) {
      name = name.replace(/\t/g, ctx.taskName);
    } else {
      name = ctx.taskName + ':' + name;
    }
    task.name = name;
    delete task['#'];
    let yaml = yamlify([task]);

    (function debugHints() {
      let hints = pt['#'];
      if (!hints) { return; }
      hints = yamlify(hints).trim();
      if (hints === '{}') { return; }
      if (hints === '[]') { return; }
      hints = hints.replace(/^|\n/g, '\n    # ');
      yaml = yaml.replace(/(?=\n|$)/, hints);
    }());

    return yaml;
  }
  return parts.map(renderPart).join('');
}


function pAllIfArray(x) { return (Array.isArray(x) ? Promise.all(x) : x); }


async function wrapTypeTr(typeTr, ctx) {
  const draft = await pAllIfArray(await typeTr(ctx));
  if (ctx.popProp) { ctx.popProp.expectEmpty(); }
  return draftObjToYaml(draft, ctx);
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
    popProp.mustBe = mustBe.getter.bind(null, popProp, taskName);
    const ctx = {
      ...sharedCtx,
      taskName,
      resId,
      origDescr: resDescr,
      popProp,
      ...contextMethods,
    };
    return vTry.pr(wrapTypeTr, 'Translating ' + taskName)(typeTr, ctx);
  }

  return translate;
}


export default init;
