import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/organizations/get/invitations', function (hooks) {
  setupTest(hooks);

  let controller;
  let store;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/organizations/get/invitations');
    store = this.owner.lookup('service:store');
  });

  module('#createOrganizationInvitation', function () {
    test('it should create an organization-invitation if the email is valid', function (assert) {
      // given
      const queryRecordStub = sinon.stub();
      store.queryRecord = queryRecordStub;
      controller.model = { organization: { id: 1 } };

      controller.userEmailToInvite = 'test@example.net';
      const lang = 'en';
      const role = 'MEMBER';

      // when
      controller.createOrganizationInvitation(lang, role);

      // then
      assert.ok(
        queryRecordStub.calledWith('organization-invitation', {
          email: 'test@example.net',
          lang,
          role,
          organizationId: 1,
        })
      );
    });

    test('it should fail if userEmailToInvite is undefined', function (assert) {
      // given
      controller.userEmailToInvite = undefined;

      // when
      controller.createOrganizationInvitation();

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(controller.userEmailToInviteError, 'Ce champ est requis.');
    });

    test('it should fail if userEmailToInvite is empty', function (assert) {
      // given
      controller.userEmailToInvite = '';

      // when
      controller.createOrganizationInvitation();

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(controller.userEmailToInviteError, 'Ce champ est requis.');
    });

    test('it should fail if userEmailToInvite is not a valid email address', function (assert) {
      // given
      controller.userEmailToInvite = 'not_valid_email';

      // when
      controller.createOrganizationInvitation();

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(controller.userEmailToInviteError, "L'adresse e-mail saisie n'est pas valide.");
    });
  });
});
