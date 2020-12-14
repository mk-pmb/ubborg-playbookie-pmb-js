// -*- coding: utf-8, tab-width: 2 -*-

import mustBe from 'typechecks-pmb/must-be';


const dlfKey = 'downloadUrls';
function nope(e) { throw new Error(`prop "${dlfKey}" ${e}`); }


function maybeDownloadFilesFromUrls(ctx, content) {
  const { path, popProp, meta, verifyHow } = ctx;
  const urls = popProp.mustBe('undef | nonEmpty ary', dlfKey);
  if (!urls) { return; }

  if (content !== undefined) { nope('conflicts "content"'); }
  const dlHow = { dest: path };
  mustBe.oneOf(['file'],
    'Target inode type for ' + dlfKey)(meta.state);

  urls.forEach((u, i) => mustBe.nest('Download URL #' + (i + 1), u));
  dlHow.url = urls[0];

  const hash = verifyHow.findStrongestHash();
  if (!hash) { nope('mandates content checksum validation'); }
  const { colonPair } = hash;
  mustBe.nest('hash.colonPair (internal API error)', colonPair);
  dlHow.checksum = colonPair;

  return { get_url: dlHow };
}


export default maybeDownloadFilesFromUrls;
