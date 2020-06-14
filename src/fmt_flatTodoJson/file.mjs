// -*- coding: utf-8, tab-width: 2 -*-


function mimeTypeToState(mt) {
  const [typeParts, ...attrs] = mt.split(/\s*;\s*/);
  const [typeCateg, typeName, ...subTypes] = typeParts.split(/\//);
  function unsupp() { throw new Error('Unsupported mimeType: ' + mt); }
  if (subTypes.length) { unsupp(); }
  if (typeCateg === 'inode') {
    if (attrs.length) { unsupp(); }
    if (typeName === 'directory') { return typeName; }
    if (typeName === 'symlink') { return 'link'; }
    unsupp();
  }
  if (mt === 'application/octet-stream;base64') { unsupp(); }
  if (mt === 'text/plain') { return 'file'; }
  return unsupp();
}


function isRegularFile(mimeType) {
  if (!mimeType) { return false; }
  if (!mimeType.startsWith('inode/')) { return true; }
  const ino = mimeType.split(/[\/;\s]+/)[1];
  if (ino === 'x-empty') { return true; }
  return false;
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

  const mimeType = popProp.mustBe('nul | nonEmpty str', 'mimeType');

  let createIfMissing;
  const meta = { path, state: 'absent' };
  if (mimeType !== null) {
    if (isRegularFile(mimeType)) {
      createIfMissing = {
        name: '\t:createIfMissing',
        copy: { dest: path, content: '', force: false },
      };
    }
    Object.assign(meta, {
      state: mimeTypeToState(mimeType),
      follow: true,
      force: false,
      owner: createOrEnforce('Owner'),
      group: createOrEnforce('Group'),
      mode: createOrEnforce('Modes'),
    });
  }

  let copy = false;
  let content = popProp.mustBe('undef | str | ary', 'content');
  if (content && content.join) { content = content.join(''); }
  if (content) { copy = { dest: path, content }; }

  const fileSteps = [
    createIfMissing,
    { name: '\t:meta', file: meta },
    (copy && { name: '\t:content', copy }),
  ];
  return fileSteps;
}


export default translate;
