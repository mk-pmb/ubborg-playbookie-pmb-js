// -*- coding: utf-8, tab-width: 2 -*-

function createOrEnforce(popProp, capKey, df) {
  const cr = popProp.mustBe('undef | nonEmpty str', 'created' + capKey);
  const en = popProp.mustBe('undef | nonEmpty str', 'enforced' + capKey);
  if (cr && (cr !== en)) {
    throw new Error(`created${capKey} different from enforced${
      capKey} isn't supported yet.`);
    // We'd need to construct something ourselves that would 'stat'
    // and then branch conditionally. => Postponed until required.
  }
  return (en || cr || df);
}


function decideFsAccessProps(popProp) {
  const upd = {
    owner:  createOrEnforce(popProp, 'Owner'),
    group:  createOrEnforce(popProp, 'Group'),
    mode:   // <-- ansible wants singular!
            createOrEnforce(popProp, 'Modes'),
  };
  return upd;
}


export default decideFsAccessProps;
