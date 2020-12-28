// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import objPop from 'objpop';
import mustBe from 'typechecks-pmb/must-be';
import aMap from 'map-assoc-core';

import parseDpkgPolicy from '../parseDpkgPolicy';

import debPkgRepo from './debPkgRepo';


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
  const pbkState = getOwn(simpleStates, stateSpec);
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


const dfrKey = 'deferredDebPkgs';

const hintSteps = aMap({
  pkgListUpd: 'Gonna update package lists. This may take a while.',
  aptDownloadProgress: [
    ('Gonna install packages now. One way to monitor apt-get downloads is: '
      + 'sudo watch ls -ho /var/cache/apt/archives/partial/'),
    ('When downloads are done, you can monitor setup activity with: '
      + 'sudo tail -F /var/log/dpkg.log'),
  ],
}, function hintStep(msg, taskName) {
  return { name: `\t:${dfrKey}:${taskName}Hint`, debug: { msg } };
});


function undefer(getSpecProp) {
  const spec = getSpecProp('undef | dictObj', dfrKey);
  if (!spec) { return []; }
  const sPop = objPop(spec, { mustBe });
  const steps = [];

  if (sPop.mustBe('undef | bool', 'updatePkgLists')) {
    steps.push(hintSteps.pkgListUpd, debPkgRepo.pkgListUpdate(false));
  }

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
    const vCtx = { resId: pkgs.slice().sort(), popProp: vRes };
    const [draft, ...more] = translate(vCtx);
    vRes.expectEmpty('Unused properties');
    if (more.length) { throw new Error('Too many steps!'); }
    if (state === 'installed') { steps.push(hintSteps.aptDownloadProgress); }
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
