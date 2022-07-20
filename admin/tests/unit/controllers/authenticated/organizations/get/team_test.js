import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/organizations/get/team', function (hooks) {
  setupTest(hooks);

  let controller;
  let store;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/organizations/get/team');
    store = this.owner.lookup('service:store');
    const notificationsStubs = {
      error: sinon.stub().returns(),
      success: sinon.stub().returns(),
    };
    controller.notifications = notificationsStubs;
  });

  module('#addMembership', function () {
    module('when user is not existing', function () {
      test('it should return an error', async function (assert) {
        // given
        const email = 'a-user-not-in-store@example.net';

        const storeQueryStub = sinon.stub();
        storeQueryStub.resolves([]);
        store.query = storeQueryStub;

        controller.model = {
          organization: {
            id: 1,
          },
        };

        controller.userEmailToAdd = email;

        // when
        await controller.addMembership();

        // then
        sinon.assert.calledWith(controller.notifications.error, 'Compte inconnu.');
        assert.ok(true);
      });
    });

    module('when user has a membership in the organization', function () {
      test('it should return an error (even if searched email is in uppercase', async function (assert) {
        // given
        const emailInLowerCase = 'a-user-already-in-organization@example.net';
        const user = { email: emailInLowerCase, id: 5 };
        const storeQueryStub = sinon.stub();
        storeQueryStub.resolves([user]);
        store.query = storeQueryStub;

        const hasMemberStub = sinon.stub();
        hasMemberStub.resolves(true);

        controller.model = {
          hasMember: hasMemberStub,
          organization: {
            id: 1,
          },
        };

        controller.userEmailToAdd = emailInLowerCase.toUpperCase();

        // when
        await controller.addMembership();

        // then
        sinon.assert.calledWith(controller.notifications.error, 'Compte déjà associé.');
        assert.ok(true);
      });
    });

    module('when user has not yet a membership in the organization', function () {
      test('it should give acces to the organization', async function (assert) {
        // given
        const email = 'a-user-not-in-organization@example.net';
        const user = { email };
        const storeQueryStub = sinon.stub();
        storeQueryStub.resolves([user]);
        store.query = storeQueryStub;

        const hasMemberStub = sinon.stub();
        const reloadStub = sinon.stub().resolves(true);
        hasMemberStub.resolves(false);
        controller.model = {
          hasMember: hasMemberStub,
          memberships: {
            reload: reloadStub,
          },
          organization: {
            id: 1,
          },
        };

        controller.userEmailToAdd = email;

        const createRecordStub = sinon.stub();
        const saveStub = sinon.stub();

        saveStub.resolves();
        createRecordStub.returns({
          save: saveStub,
        });

        store.createRecord = createRecordStub;

        // when
        await controller.addMembership();

        // then
        assert.deepEqual(controller.userEmailToAdd, null);
        assert.ok(controller.model.memberships.reload.calledOnce);
        sinon.assert.calledWith(controller.notifications.success, 'Accès attribué avec succès.');
        assert.ok(true);
      });

      test('it should notify when error', async function (assert) {
        // given
        const email = 'a-user-not-in-organization@example.net';
        const user = { email };
        const storeQueryStub = sinon.stub();
        storeQueryStub.resolves([user]);
        store.query = storeQueryStub;

        const hasMemberStub = sinon.stub();
        const reloadStub = sinon.stub().rejects('some error');
        hasMemberStub.resolves(false);
        controller.model = {
          hasMember: hasMemberStub,
          memberships: {
            reload: reloadStub,
          },
          organization: {
            id: 1,
          },
        };

        controller.userEmailToAdd = email;

        const createRecordStub = sinon.stub();
        const saveStub = sinon.stub();

        saveStub.resolves();
        createRecordStub.returns({
          save: saveStub,
        });

        store.createRecord = createRecordStub;

        // when
        await controller.addMembership();

        // then
        sinon.assert.calledWith(controller.notifications.error, 'Une erreur est survenue.');
        assert.ok(true);
      });
    });
  });
});
