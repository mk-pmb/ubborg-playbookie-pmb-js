// -*- coding: utf-8, tab-width: 2 -*-

import objPop from 'objpop';
import mustBe from 'typechecks-pmb/must-be';

import parseDpkgPolicy from '../parseDpkgPolicy';


const simpleStates = {
  installed: { state: 'present' },
  absent: { state: 'absent' },
};


function parsePresenceMarker(spec, pkgName) {
  if (spec === null) { return null; }
  if (!spec) {
    return `file:/usr/share/doc/${pkgName}/copyright`;
    /*
      On Ubuntu, the copyright file is an amazingly accurate oracle:
      diff -sU 0 <(dpkg --get-selections | grep -Pe '\s(install|hold)$' \
        | grep -oPe '^[^\s:]+' | sort -V) <(
        printf '%s\n' /usr/share/doc/*''/copyright | cut -d / -sf 5 | sort -V)
    */
  }
  if (spec === 'cmd:') { return spec + pkgName; }
  const [proto, ...colonParts] = spec.split(/:/);
  if (colonParts.length) {
    if (proto === 'file') { return spec; }
    if (proto === 'cmd') { return spec; }
  }
  throw new Error('Unsupported presenceMarker spec: ' + spec);
}


function translate(ctx) {
  const { resId: pkgName, popProp } = ctx;

  const stateSpec = popProp.mustBe('nonEmpty str', 'state');
  const pbkState = simpleStates[stateSpec];
  if (!pbkState) { throw new Error('Unsupported state: ' + stateSpec); }

  const policy = popProp.mustBe('undef | dictObj', 'policy');
  const dpkgOpt = parseDpkgPolicy(policy).join(',');
  const steps = [];

  const presSpec = popProp.mustBe('undef | nul | nonEmpty str',
    'presenceMarker');
  const presFile = parsePresenceMarker(presSpec, pkgName, pbkState.state);
  if (presFile !== null) {
    steps.push('# \t: presence marker file (not supported yet): ' + presFile);
  }

  const deferToEndOfStage = popProp.mustBe('bool', 'defer');
  if (deferToEndOfStage) {
    return [...steps, '# \t: deferred to end of stage.'];
  }

  const apt = {
    name: pkgName,
    ...pbkState,
    install_recommends: false,
    dpkg_options: dpkgOpt,
  };

  return [...steps, { apt }];
}


function undefer(getSpecProp) {
  const dfrKey = 'deferredDebPkgs';
  const spec = getSpecProp('undef | dictObj', dfrKey);
  if (!spec) { return []; }
  const steps = [];

  const sPop = objPop(spec, { mustBe });
  sPop.mustBe('undef | pos0', 'modifies');
  const policy = sPop.mustBe('undef | dictObj', 'policy');

  function tr(prop, state) {
    const pkgs = sPop.mustBe('undef | zero | nonEmpty ary', prop);
    if (!pkgs) { return; }
    const vRes = objPop({
      state,
      presenceMarker: null,
      defer: false,
      policy,
    }, { mustBe });
    const vCtx = { resId: pkgs, popProp: vRes };
    const [draft, ...more] = translate(vCtx);
    vRes.expectEmpty('Unused properties');
    if (more.length) { throw new Error('Too many steps!'); }
    steps.push({ name: `\t:${dfrKey}:${prop}`, ...draft });
  }
  tr('removes',   'absent');
  tr('installs',  'installed');

  sPop.expectEmpty('Unsupported feature(s)');
  return steps;
}


Object.assign(translate, {
  undefer,
});

export default translate;
