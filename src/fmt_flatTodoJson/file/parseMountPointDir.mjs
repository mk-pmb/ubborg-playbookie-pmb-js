// -*- coding: utf-8, tab-width: 2 -*-

import preCheck from './preCheck';


const { tmpVar } = preCheck;

function isMountedMountPoint(ctx) {
  return {
    command: { chdir: '/', argv: ['mountpoint', '--quiet', ctx.path] },
    failed_when: [tmpVar + '.rc > 1'],
    changed_when: false,
  };
}

function parseMountPointDir(ctx) {
  ctx.upd({
    preCheck: isMountedMountPoint,
    metaCond: { when: tmpVar + '.rc == 1' },
  });
}


export default parseMountPointDir;
