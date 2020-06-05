// -*- coding: utf-8, tab-width: 2 -*-

const gecosFieldParts = [
  'fullName',
  'buildingAndRoomNumber',
  'officePhoneNumber',
  'homePhoneNumber',
  'additionalContactInfo',
];


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
  return { user: {
    name: loginName,
    state: 'absent',
    ...(popProp.mustBe('bool', 'exists') && {
      state: 'present',
      uid: popProp.mustBe('undef | pos num', 'userIdNum'),
      append: true,
      create_home: false,
      comment: gecosFieldParts.map(popStrEmptyUndef).join(','),
      group: popProp.mustBe('undef | nonEmpty str', 'primaryGroupName'),
      home: popProp.mustBe('nonEmpty str', 'homeDirPath'),
      password: popProp.mustBe('nonEmpty str', 'passwordHash', '!'),
      update_password: (popProp.mustBe('bool',
        'preserveExistingPasswordHash') ? 'on_create' : 'always'),
      password_lock: popProp.mustBe('bool', 'disablePasswordLogin'),
      system: !popProp.mustBe('bool', 'interactive', false),
      shell: parseShell(popProp),
    }),
  } };
}


export default translate;
