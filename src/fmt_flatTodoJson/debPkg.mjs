// -*- coding: utf-8, tab-width: 2 -*-


const simpleStates = {
  installed: { state: 'present' },
  purged: { state: 'absent', purge: true },
};


function parsePresenceMarker() {
}


function translate(ctx) {
  const { resId: pkgName, popProp } = ctx;

  const stateSpec = popProp.mustBe('nonEmpty str', 'state');
  const pbkState = simpleStates[stateSpec];
  if (!pbkState) { throw new Error('Unsupported state: ' + stateSpec); }

  const presSpec = popProp.mustBe('undef | nonEmpty str', 'presenceMarker');
  const presCond = parsePresenceMarker(presSpec, pbkState.state);

  const apt = {
    name: pkgName,
    install_recommends: false,
    ...pbkState,
    ...presCond,
  };

  return { apt };
}


export default translate;
