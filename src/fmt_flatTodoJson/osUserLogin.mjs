// -*- coding: utf-8, tab-width: 2 -*-

function translate(ctx) {
  const { resId: loginName, popProp } = ctx;
  return { group: {
    name: loginName,
    state: 'absent',
    ...(popProp.mustBe('bool', 'exists') && {
      state: 'present',
      uid: (+popProp('userIdNum') || undefined),
      append: true,
      create_home: false,
      comment: [
        (popProp('fullName') || ''),
        (popProp('buildingAndRoomNumber') || ''),
        (popProp('officePhoneNumber') || ''),
        (popProp('homePhoneNumber') || ''),
        (popProp('additionalContactInfo') || ''),
      ].join(',').replace(/,+$/, ''),
      group: popProp('primaryGroupName'),
      home: popProp.mustBe('nonEmpty str', 'homeDirPath',
        '/home/' + loginName),
      password: popProp.mustBe('nonEmpty str', 'passwordHash', '!'),
      update_password: (popProp.mustBe('bool',
        'preserveExistingPasswordHash') ? 'on_create' : 'always'),
      password_lock: popProp.mustBe('bool', 'disablePasswordLogin'),
      system: !popProp.mustBe('bool', 'interactive', false),
      shell: popProp('shell'),
    }),
  } };
}


export default translate;
