// -*- coding: utf-8, tab-width: 2 -*-

import pbkVarSlot from '../../pbkUtil/varSlot';


function configureLink(ctx, dest) {
  const { meta, statVar } = ctx;
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
  ctx.upd({ needPreStat: true });
  meta.force = pbkVarSlot(vs => vs.condList('or', [
    `not ${statVar}.stat.exists`,
    `${statVar}.stat.islnk`,
  ]));
}


export default configureLink;
