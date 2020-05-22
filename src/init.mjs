// -*- coding: utf-8, tab-width: 2 -*-

async function init(format, opts) {
  const fmtName = String((format || false).name);
  let impl;
  try {
    impl = (await import('./fmt_' + fmtName + '/init')).default;
  } catch (impErr) {
    const err = new Error('Unsupported input format "' + fmtName + '": '
      + String(impErr.message || impErr));
    throw err;
  }
  return impl(format, opts);
}

export default init;
