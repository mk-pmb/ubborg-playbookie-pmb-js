// -*- coding: utf-8, tab-width: 2 -*-

import objPop from 'objpop';
import mustBe from 'typechecks-pmb/must-be';
import mustLookupProp from 'must-lookup-prop-in-dict-pmb';
import aMap from 'map-assoc-core';


const dangerZone = { flinch: 'refuse', yolo: 'force' };

function minusFlag([k, v]) { return (v ? `${v}-${k}` : false); }


function parseDpkgPolicy(policy) {
  const pop = objPop(policy, { mustBe });
  const flags = {
    ...aMap({
      conflicts:  'conflict',
      breaks:     'incompatible',
    }, rule => mustLookupProp('policy rules', pop.ifHas, dangerZone, rule)),
    confold:    'force',
  };

  const keepCfg = pop.mustBe('bool', 'tryPreserveOldConfig');
  if (!keepCfg) { flags.confdef = 'force'; }

  pop.expectEmpty('Unsupported policy rule(s)');
  return Object.entries(flags).map(minusFlag).filter(Boolean);
}


export default parseDpkgPolicy;
