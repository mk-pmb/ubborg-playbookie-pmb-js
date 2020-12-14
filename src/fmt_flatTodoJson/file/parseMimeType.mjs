// -*- coding: utf-8, tab-width: 2 -*-

import splitOnce from 'split-string-or-buffer-once-pmb';


function lcInArray(x, a) { return a.includes(x && String(x).toLowerCase()); }


const charsetsCompatibleToUtf8 = [
  'utf-8',
  'us-ascii',
];


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
    if (typeParts === 'text/plain') {
      attrs.forEach(function validate(origAtt) {
        const [atKey, atVal] = (splitOnce('=', origAtt) || [origAtt]);
        if (atKey === 'charset') {
          if (lcInArray(atVal, charsetsCompatibleToUtf8)) { return; }
        }
        throw new Error('Unsupported mimeType attribute ' + origAtt);
      });
      return reguFile;
    }
    return unsupp();
  }

  return Object.assign(mimeInfo, decide());
}


export default parseMimeType;
