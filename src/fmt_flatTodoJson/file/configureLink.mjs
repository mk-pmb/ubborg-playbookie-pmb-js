// -*- coding: utf-8, tab-width: 2 -*-

import pbkVarSlot from '../../pbkUtil/varSlot';

import preCheck from './preCheck';

const { tmpVar } = preCheck;


function configureLink(ctx, dest) {
  const { meta } = ctx;
  meta.src = dest;
  meta.follow = false;  // otherwise we might chown/chmod the target!

  /* === Use the force? ===
    We'd like to ignore whether the target exists yet, but we'd also
    like to not replace a potentially-important file.
    Unfortunately, ansible 2.9 conflates both of these totally different
    risk considerations into one option, so let's at least try to
    mitigate the damages.

    Situations with acceptable risk of replacing `path`:
      - When it doesn't exist yet: Hopefully no race condition.
      - When it's a symlink: We assume it was already managed by your
        config system and the old value is "backed up" somewhere in your
        config recipe git repo.
  */
  ctx.upd({ preCheck: 'stat' });
  meta.force = pbkVarSlot(vs => vs.condList('or', [
    `not ${tmpVar}.stat.exists`,
    `${tmpVar}.stat.islnk`,
  ]));
}


export default configureLink;
