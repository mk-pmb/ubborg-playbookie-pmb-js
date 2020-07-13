// -*- coding: utf-8, tab-width: 2 -*-


import makeValidationMethodPopper from './file/makeValidationMethodPopper';

const latestKnownAnsibleVersion = '2.9.9';


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


function translate(ctx) {
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

  const copy = (function parseContent() {
    let content = popProp.mustBe('undef | str | ary', 'content');

    const ulfKey = 'uploadFromLocalPath';
    let ulfPath = popProp.mustBe('undef | tru | nonEmpty str', ulfKey);
    if (ulfPath) {
      if (ulfPath === true) { ulfPath = path; }
      const nope = (e) => { throw new Error(`prop "${ulfKey}" ${e}`); };
      if (content !== undefined) { nope('conflicts "content"'); }
      if (meta.state !== 'file') { nope('only supported for regular files'); }
      if (!ulfPath.startsWith('/')) { nope('must be absolute'); }

      verifyHow.joinHash('sha1hex', (want) => {
        const { checksum } = copy;
        if (checksum && (checksum !== want)) {
          throw new Error('Disagreement about which SHA-1 checksum to expect');
        }
        copy.checksum = want;
      });

      const ansibleCopyCannot = [
        'sha256hex',
        'sha512hex',
      ].filter(algo => verifyHow.joinHash(algo));
      if (ansibleCopyCannot.length) {
        ctx.warn(`Ignoring these checksums because ansible v${
          latestKnownAnsibleVersion}'s copy module doesn't support them: ${
          ansibleCopyCannot.join(', ')}`);
      }

      if (popProp('downloadUrls')) {
        ctx.warn('Ignoring downloadUrls in favor of', ulfKey);
      }
      return { dest: path, src: ulfPath };
    }

    if (content === undefined) { return; }
    if (content.join) { content = content.join(''); }
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
