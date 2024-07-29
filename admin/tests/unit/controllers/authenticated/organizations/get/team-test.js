import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/organizations/get/team', function (hooks) {
  setupTest(hooks);

  let controller;
  let store;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/organizations/get/team');
    store = this.owner.lookup('service:store');

    controller.notifications = {
      error: sinon.stub(),
      success: sinon.stub(),
    };
  });

  module('#addOrganizationMembership', function () {
    module('when user is not existing', function () {
      test('it should return an error', async function (assert) {
        // given
        store.query = sinon.stub().resolves([]);

        controller.model = {
          organization: { id: 1 },
        };
        controller.userEmailToAdd = 'a-user-not-in-store@example.net';

        // when
        await controller.addOrganizationMembership();

        // then
        sinon.assert.calledWith(controller.notifications.error, 'Compte inconnu.');
        assert.ok(true);
      });
    });

    module('when user has a membership in the organization', function () {
      test('it should return an error (even if searched email is in uppercase)', async function (assert) {
        // given
        const emailInLowerCase = 'a-user-already-in-organization@example.net';
        const user = store.createRecord('user', { email: emailInLowerCase, id: 5 });

        store.query = sinon.stub().resolves([user]);
        controller.model = {
          organization: {
            id: 1,
            hasMember: sinon.stub().resolves(true),
          },
        };
        controller.userEmailToAdd = emailInLowerCase.toUpperCase();

        // when
        await controller.addOrganizationMembership();

        // then
        sinon.assert.calledWith(controller.notifications.error, 'Compte déjà associé.');
        assert.ok(true);
      });
    });

    module('when user has not yet a membership in the organization', function () {
      test('it should give access to the organization', async function (assert) {
        // given
        const email = 'a-user-not-in-organization@example.net';
        const user = store.createRecord('user', { email, id: 5 });

        store.query = sinon.stub().resolves([user]);
        store.createRecord = sinon.stub().returns({ save: sinon.stub() });

        controller.model = {
          organizationMemberships: {
            reload: sinon.stub().resolves(true),
          },
          organization: {
            id: 1,
            hasMember: sinon.stub().resolves(false),
          },
        };
        controller.userEmailToAdd = email;

        // when
        await controller.addOrganizationMembership();

        // then
        assert.deepEqual(controller.userEmailToAdd, null);
        assert.ok(controller.model.organizationMemberships.reload.calledOnce);
        sinon.assert.calledWith(controller.notifications.success, 'Accès attribué avec succès.');
        assert.ok(true);
      });

      test('it should notify when error', async function (assert) {
        // given
        const email = 'a-user-not-in-organization@example.net';
        const user = store.createRecord('user', { email, id: 5 });

        store.query = sinon.stub().resolves([user]);
        store.createRecord = sinon.stub().returns({ save: sinon.stub() });
        controller.model = {
          organizationMemberships: {
            reload: sinon.stub().rejects('some error'),
          },
          organization: {
            hasMember: sinon.stub().resolves(false),
            id: 1,
          },
        };
        controller.userEmailToAdd = email;

        // when
        await controller.addOrganizationMembership();

        // then
        sinon.assert.calledWith(controller.notifications.error, 'Une erreur est survenue.');
        assert.ok(true);
      });
    });
  });
});
