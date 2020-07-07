// -*- coding: utf-8, tab-width: 2 -*-

const ignoreProps = [
  // ignored because they're managed via a file resource's content.
  'debUrls',
  'dists',
  'components',
  'src',
];


function pkgListUpdate(defer) {
  return (defer ? '# \t: package lists will be updated later'
    : { name: '\t:updatePkgLists', apt: { update_cache: true } });
}


function translate(ctx) {
  const { popProp } = ctx;
  ignoreProps.forEach(popProp);
  const steps = [];

  const state = popProp.mustBe('nonEmpty str', 'state');
  if (state !== 'enabled') { throw new Error('Unsupported state: ' + state); }

  const defer = popProp.mustBe('bool', 'deferPkgListUpdate');
  steps.push(pkgListUpdate(defer));

  if (popProp.mustBe('undef | nonEmpty str', 'trustedLocalAptKeyRingName')) {
    // At this time the actual work should have been done by a file resource.
    [
      'keyUrl',
      'keyVerify',
    ].forEach(popProp);
  }

  return steps;
}

Object.assign(translate, {
  pkgListUpdate,
});

export default translate;
