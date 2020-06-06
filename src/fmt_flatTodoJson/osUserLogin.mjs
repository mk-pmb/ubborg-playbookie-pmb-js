// -*- coding: utf-8, tab-width: 2 -*-

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


function translate(ctx) {
  const { resId: loginName, popProp } = ctx;
  function popStrEmptyUndef(k) { return popProp.mustBe('undef | str', k, ''); }

  if (!popProp.mustBe('bool', 'exists')) {
    return { user: { name: loginName, state: 'absent' } };
  }

  return [
    { name: ctx.taskName + ':meta',
      user: {
        name: loginName,
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
        name: loginName,
        password_lock: popProp.mustBe('bool', 'disablePasswordLogin'),
      },
    },
  ];
}


export default translate;
