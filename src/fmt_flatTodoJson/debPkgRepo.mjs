// -*- coding: utf-8, tab-width: 2 -*-

const ignoreProps = [
  // ignored because they're managed via a file resource's content.
  'urls',
  'dists',
  'components',
  'src',
];


const trans = Object.assign(function translate(ctx) {
  const { popProp } = ctx;
  ignoreProps.forEach(popProp);
  const steps = [];

  const state = popProp.mustBe('nonEmpty str', 'state');
  if (state !== 'enabled') { throw new Error('Unsupported state: ' + state); }

  const defer = popProp.mustBe('bool', 'deferPkgListUpdate');
  steps.push(trans.pkgListUpdate(defer));
  return steps;
}, {

  pkgListUpdate(defer) {
    return (defer ? '# \t: package lists will be updated later'
      : { name: '\t:updatePkgLists', apt: { update_cache: true } });
  },

});


export default trans;
