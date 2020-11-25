// -*- coding: utf-8, tab-width: 2 -*-

const ignoreProps = [
  // ignored because they're managed via a file resource's content.
  'archs',
  'components',
  'debUrls',
  'dists',
  'keyUrls',
  'keyVerify',
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
  switch (state) {
    case 'enabled':
    case 'disabled':
    case 'absent':
      break;
    default:
      throw new Error('Unsupported state: ' + state);
  }

  const defer = popProp.mustBe('bool', 'deferPkgListUpdate');
  steps.push(pkgListUpdate(defer));

  const lakr = 'trustedLocalAptKeyRingName';
  if (popProp.mustBe('undef | nonEmpty str', lakr)) {
    throw new Error(lakr + ' is deprecated!');
  }

  return steps;
}

Object.assign(translate, {
  pkgListUpdate,
});

export default translate;
