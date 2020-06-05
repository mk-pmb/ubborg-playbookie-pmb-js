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


function translate(ctx) {
  const { taskName, resId: path, popProp } = ctx;

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

  const file = { path, state: 'absent' };
  if (mimeType !== null) {
    Object.assign(file, {
      state: mimeTypeToState(mimeType),
      follow: true,
      force: false,
      owner: createOrEnforce('Owner'),
      group: createOrEnforce('Group'),
      modes: createOrEnforce('Modes'),
    });
  }

  let copy = false;
  const content = popProp.mustBe('undef | str', 'content');
  if (content) { copy = { dest: path, content }; }

  return [
    { name: taskName + ':meta', file },
    (copy && { name: taskName + ':content', copy }),
  ];
}


export default translate;
