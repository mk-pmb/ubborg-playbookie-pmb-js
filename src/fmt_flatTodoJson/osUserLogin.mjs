// -*- coding: utf-8, tab-width: 2 -*-

const workarounds = {

  create_home: false,
  // ^- Sneaky ansible 2.9.6 is really keen on creating home directories
  //    and littering them with default files. It will use any occasion
  //    whatsoever as soon as your attention slips for a second.

};


const gecosFieldParts = [
  'fullName',
  'buildingAndRoomNumber',
  'officePhoneNumber',
  'homePhoneNumber',
  'additionalContactInfo',
];


function makeGecosComment(popStr) {
  const parts = gecosFieldParts.map(popStr);
  return (parts.join('') && parts.join(','));
}


function parseShell(popProp) {
  const spec = popProp.mustBe('undef | fal | nonEmpty str', 'shell', false);
  if (spec === false) { return '/bin/false'; }
  if (!spec) { return spec; }
  if (spec.startsWith('/')) { return spec; }
  return '/bin/' + spec;
}


const oul = function translate(ctx) {
  const { resId: loginName, popProp } = ctx;
  function popStrEmptyUndef(k) { return popProp.mustBe('undef | str', k, ''); }

  const basics = {
    ...workarounds,
    name: loginName,
  };

  if (!popProp.mustBe('bool', 'exists')) {
    return { user: { state: 'absent' } };
  }

  return [
    { name: ctx.taskName + ':meta',
      user: {
        ...basics,
        state: 'present',
        uid: popProp.mustBe('undef | pos num', 'userIdNum'),
        append: true,
        create_home: false,
        comment: makeGecosComment(popStrEmptyUndef),
        group: popProp.mustBe('undef | nonEmpty str', 'primaryGroupName'),
        home: popProp.mustBe('nonEmpty str', 'homeDirPath'),
        password: popProp.mustBe('nonEmpty str', 'passwordHash', '!'),
        update_password: (popProp.mustBe('bool',
          'preserveExistingPasswordHash') ? 'on_create' : 'always'),
        system: !popProp.mustBe('bool', 'interactive', false),
        shell: parseShell(popProp),
      },
    },
    { name: ctx.taskName + ':pwlock',
      // Ansible docs for "password_lock" say
      // "Do not change the password in the same task."
      user: {
        ...basics,
        password_lock: popProp.mustBe('bool', 'disablePasswordLogin'),
      },
    },
  ];
};

Object.assign(oul, {
  workarounds,
});

export default oul;
