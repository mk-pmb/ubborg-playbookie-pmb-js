// -*- coding: utf-8, tab-width: 2 -*-

import regexUtil from 'rxu';


function translate(ctx) {
  const { popProp } = ctx;
  const path = popProp.mustBe('nonEmpty str', 'path');
  const section = popProp.mustBe('str', 'sect');
  const ini = { path, section, state: 'absent' };

  const exists = popProp.mustBe('bool', 'exists');
  if (exists) {
    ini.state = 'present';
    // Bug: in ansible 2.9.9, this will add a line "None=None" in each play.
    // Workaround: use lineinfile
    const sectHead = '[' + section + ']';
    const sectRgx = '^' + regexUtil.quotemeta(sectHead) + '$';
    return [
      { name: '\t:head',
        lineinfile: {
          path,
          state: 'present',
          line: sectHead,
        },
      },
      { name: '\t:pad',
        // Having a blank line in front of the first secion is a bit ugly,
        // but ini_file _with_ an option would do that as well.
        lineinfile: {
          path,
          state: 'present',
          line: '',
          insertbefore: sectRgx,
        },
      },
    ];
  }

  return { ini_file: ini };
}


export default translate;
