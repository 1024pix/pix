import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | campaigns/invited/fill-in-participant-external-id', function (hooks) {
  setupTest(hooks);

  let route, campaign;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:campaigns.invited.fill-in-participant-external-id');
    route.campaignStorage = { get: sinon.stub(), set: sinon.stub() };
    route.modelFor = sinon.stub();
    route.router = { replaceWith: sinon.stub() };
  });

  module('#model', function () {
    test('should load model', async function (assert) {
      //when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
      assert.ok(true);
    });
  });

  module('#afterModel', function () {
    test('should redirect to entrance page if an external id is already set', async function (assert) {
      //given
      campaign = EmberObject.create({
        idPixLabel: 'indentifiant externe',
      });
      route.campaignStorage.get.withArgs(campaign.code, 'participantExternalId').returns('someID');

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entrance', campaign.code);
      assert.ok(true);
    });

    test('should redirect to entrance page if an external id is not required', async function (assert) {
      //given
      campaign = EmberObject.create({
        idPixLabel: null,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'participantExternalId').returns(null);

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entrance', campaign.code);
      assert.ok(true);
    });

    test('should not redirect if an external id is required and not already set', async function (assert) {
      //given
      campaign = EmberObject.create({
        idPixLabel: 'identifiant externe',
      });
      route.campaignStorage.get.withArgs(campaign.code, 'participantExternalId').returns(null);

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.notCalled(route.router.replaceWith);
      assert.ok(true);
    });
  });
});
