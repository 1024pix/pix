import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | Invited', function (hooks) {
  setupTest(hooks);

  let route, campaign;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:campaigns.invited');
    route.modelFor = sinon.stub();
    route.router = { replaceWith: sinon.stub(), transitionTo: sinon.stub() };
    route.campaignStorage = { get: sinon.stub() };
  });

  module('#beforeModel', function () {
    test('should redirect to entry point when /prescrit is directly set in the url', async function (assert) {
      //when
      await route.beforeModel({ from: null });

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entry-point');
    });

    test('should continue en entrance route when from is set', async function (assert) {
      //when
      await route.beforeModel({ from: 'campaigns.entry-point' });

      //then
      assert.expect(0);
      sinon.assert.notCalled(route.router.replaceWith);
    });
  });

  module('#model', function () {
    test('should load model', async function (assert) {
      //when
      await route.model();

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.modelFor, 'campaigns');
    });
  });

  module('#afterModel', function () {
    test('should redirect to student sco invited page when association is needed', async function (assert) {
      //given
      campaign = EmberObject.create({
        isRestricted: true,
        isOrganizationSCO: true,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(false);

      //when
      await route.afterModel(campaign);

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.invited.student-sco', campaign.code);
    });

    test('should redirect to student sup invited page when association is needed', async function (assert) {
      //given
      campaign = EmberObject.create({
        isRestricted: true,
        isOrganizationSUP: true,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(false);

      //when
      await route.afterModel(campaign);

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.invited.student-sup', campaign.code);
    });

    test('should redirect to fill in participant external otherwise', async function (assert) {
      //given
      campaign = EmberObject.create({
        isRestricted: false,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(false);

      //when
      await route.afterModel(campaign);

      //then
      assert.expect(0);
      sinon.assert.calledWith(
        route.router.replaceWith,
        'campaigns.invited.fill-in-participant-external-id',
        campaign.code
      );
    });
  });
});
