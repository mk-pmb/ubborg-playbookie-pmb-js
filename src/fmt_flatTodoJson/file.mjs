// -*- coding: utf-8, tab-width: 2 -*-

import makeValidationMethodPopper from './file/makeValidationMethodPopper';
import maybeUploadLocalFiles from './file/maybeUploadLocalFiles';


function maybeJoin(x) { return ((x && x.join) ? x.join('') : x); }


function parseMimeType(mt) {
  const [typeParts, ...attrs] = mt.split(/\s*;\s*/);
  const [typeCateg, typeName, ...subTypes] = typeParts.split(/\//);
  const mimeInfo = { regular: false };

  function unsupp() { throw new Error('Unsupported mimeType: ' + mt); }
  const reguFile = { state: 'file', regular: true };

  function decide() {
    if (subTypes.length) { unsupp(); }
    if (typeCateg === 'inode') {
      if (attrs.length) { unsupp(); }
      if (typeName === 'x-empty') { return reguFile; }
      if (typeName === 'directory') { return { state: typeName }; }
      if (typeName === 'symlink') { return { state: 'link' }; }
      unsupp();
    }
    if (typeParts === 'application/octet-stream') {
      if (attrs.length) { unsupp(); }
      return reguFile;
    }
    if (mt === 'text/plain') {
      attrs.forEach(function validate(att) {
        unsupp(att);
      });
      return reguFile;
    }
    return unsupp();
  }

  return Object.assign(mimeInfo, decide());
}


async function translate(ctx) {
  const { resId: path, popProp } = ctx;

  function createOrEnforce(prop, df) {
    const cr = popProp.mustBe('undef | nonEmpty str', 'created' + prop);
    const en = popProp.mustBe('undef | nonEmpty str', 'enforced' + prop);
    if (cr && (cr !== en)) {
      throw new Error(`created${prop} different from enforced${
        prop} isn't supported yet.`);
      // We'd need to construct something ourselves that would 'stat'
      // and then branch conditionally. => Postponed until required.
    }
    return (en || cr || df);
  }

  const replace = popProp.mustBe('undef | bool', 'replace');
  if (replace === false) {
    throw new Error("Not replacing the file isn't supported yet.");
  }

  let createIfMissing;
  const meta = { path, state: 'absent' };
  const mimeType = popProp.mustBe('nul | nonEmpty str', 'mimeType');
  if (mimeType !== null) {
    const mimeInfo = parseMimeType(mimeType);
    if (mimeInfo.regular) {
      createIfMissing = {
        name: '\t:createIfMissing',
        copy: { dest: path, content: '', force: false },
      };
    }
    Object.assign(meta, {
      state: mimeInfo.state,
      follow: true,
      force: false,
      owner: createOrEnforce('Owner'),
      group: createOrEnforce('Group'),
      mode: createOrEnforce('Modes'),
    });
  }

  const verifyHow = makeValidationMethodPopper(popProp);

  const copy = await (async function parseContent() {
    const content = maybeJoin(popProp.mustBe('undef | str | ary', 'content'));
    const ulf = maybeUploadLocalFiles(ctx, content, meta, verifyHow);
    if (ulf) { return ulf; }

    if (content === undefined) { return; }
    if (meta.state === 'link') {
      meta.src = content;
      return;
    }
    if (meta.state === 'file') { return { dest: path, content }; }
  }());

  verifyHow.expectEmpty('Unsupported validation option(s)');

  const fileSteps = [
    createIfMissing,
    { name: '\t:meta', file: meta },
    (copy && { name: '\t:content', copy }),
  ];
  return fileSteps;
}


export default translate;
