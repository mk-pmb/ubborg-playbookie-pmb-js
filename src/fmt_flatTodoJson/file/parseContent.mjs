// -*- coding: utf-8, tab-width: 2 -*-

import maybeUploadLocalFiles from './maybeUploadLocalFiles.mjs';
import maybeDownloadFilesFromUrls from './maybeDownloadFilesFromUrls.mjs';
import configureLink from './configureLink.mjs';


function maybeJoin(x) { return ((x && x.join) ? x.join('') : x); }


async function parseContent(ctx) {
  const { path, popProp, meta } = ctx;
  const content = maybeJoin(popProp.mustBe('undef | str | ary', 'content'));
  const external = (
    maybeUploadLocalFiles(ctx, content)
    || maybeDownloadFilesFromUrls(ctx, content)
  );
  if (external) { return external; }
  if (content === undefined) { return; }
  const mst = meta.state;
  if (mst === 'link') { return configureLink(ctx, content); }
  if (mst === 'file') { return { copy: { dest: path, content } }; }
  return false;
}


export default parseContent;
