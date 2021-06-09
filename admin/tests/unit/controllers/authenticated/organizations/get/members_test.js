import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Controller | authenticated/organizations/get/members', function(hooks) {
  setupTest(hooks);

  let controller;
  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/organizations/get/members');
  });

  module('#createOrganizationInvitation', function() {

    test('it should create an organization-invitation if the email is valid', function(assert) {
      // given
      const saveStub = sinon.stub().resolves();
      const createRecordStub = sinon.stub().returns({
        save: saveStub,
      });
      controller.store = Service.create({ createRecord: createRecordStub });
      controller.model = { organization: { id: 1 } };

      controller.userEmailToInvite = 'test@example.net';
      const lang = 'en';

      // when
      controller.createOrganizationInvitation(lang);

      // then
      assert.ok(createRecordStub.calledWith('organization-invitation', { email: 'test@example.net', lang }));
      assert.equal(saveStub.callCount, 1);
    });

    test('it should fail if userEmailToInvite is undefined', function(assert) {
      // given
      controller.userEmailToInvite = undefined;

      // when
      controller.createOrganizationInvitation();

      // then
      assert.equal(controller.userEmailToInviteError, 'Ce champ est requis.');
    });

    test('it should fail if userEmailToInvite is empty', function(assert) {
      // given
      controller.userEmailToInvite = '';

      // when
      controller.createOrganizationInvitation();

      // then
      assert.equal(controller.userEmailToInviteError, 'Ce champ est requis.');
    });

    test('it should fail if userEmailToInvite is not a valid email address', function(assert) {
      // given
      controller.userEmailToInvite = 'not_valid_email';

      // when
      controller.createOrganizationInvitation();

      // then
      assert.equal(controller.userEmailToInviteError, 'L\'adresse email saisie n\'est pas valide.');
    });
  });
});
