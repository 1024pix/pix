import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Controller | authenticated/target-profiles/target-profile/organizations', function (hooks) {
  setupTest(hooks);
  const organizationId = 1;
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated.target-profiles.target-profile.organizations');
    controller.router = { transitionTo: sinon.stub() };
    controller.model = {
      targetProfile: {
        id: 3,
      },
    };
    controller.notifications = {
      success: sinon.stub(),
      error: sinon.stub(),
    };
    controller.store = {
      adapterFor: sinon.stub().returns({
        detachOrganizations: sinon.stub(),
      }),
    };
  });

  module('#detachOrganizations', function () {
    test('it should display a confirmation message after detaching an organization from a target profile', async function (assert) {
      // given
      controller.store.adapterFor('target-profile').detachOrganizations.resolves([organizationId]);

      // when
      await controller.detachOrganizations(organizationId);

      // then
      assert.true(
        controller.notifications.success.calledWith(`Organisation(s) détachée(s) avec succès : ${organizationId}`, {
          htmlContent: true,
        }),
      );
    });

    test('it should reload the page after detaching an organization from a target profile', async function (assert) {
      // given
      controller.store.adapterFor('target-profile').detachOrganizations.resolves([organizationId]);

      // when
      await controller.detachOrganizations(organizationId);

      // then
      assert.true(
        controller.router.transitionTo.calledWith('authenticated.target-profiles.target-profile.organizations'),
      );
    });

    test('it should display a generic message for any error', async function (assert) {
      // given
      //no mock for the api call

      // when
      await controller.detachOrganizations(organizationId);

      // then
      assert.true(controller.notifications.error.calledWith('Une erreur est survenue.'));
    });
  });
});
