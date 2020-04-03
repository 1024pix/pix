import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Controller | authenticated/organizations/list', function(hooks) {

  setupTest(hooks);

  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/organizations/get');
  });

  module('#createOrganizationInvitation', function() {

    test('it should create an organization-invitation if the email is valid', function(assert) {
      const saveStub = sinon.stub().resolves();
      const createRecordStub = sinon.stub().returns({
        save: saveStub
      });
      controller.store = Service.create({ createRecord: createRecordStub });
      controller.model = { id: 1 };

      controller.userEmailToInvite = 'test@example.net';

      controller.createOrganizationInvitation();

      assert.ok(createRecordStub.calledWith('organization-invitation', { email: 'test@example.net' }));
      assert.equal(saveStub.callCount, 1);
    });

    test('it should fail if userEmailToInvite is undefined', function(assert) {
      controller.userEmailToInvite = undefined;

      controller.createOrganizationInvitation();

      assert.equal(controller.userEmailToInviteError, 'Ce champ est requis.');
    });

    test('it should fail if userEmailToInvite is empty', function(assert) {
      controller.userEmailToInvite = '';

      controller.createOrganizationInvitation();

      assert.equal(controller.userEmailToInviteError, 'Ce champ est requis.');
    });

    test('it should fail if userEmailToInvite is not a valid email address', function(assert) {
      controller.userEmailToInvite = 'not_valid_email';

      controller.createOrganizationInvitation();

      assert.equal(controller.userEmailToInviteError, 'L\'adresse email saisie n\'est pas valide.');
    });
  });
});
