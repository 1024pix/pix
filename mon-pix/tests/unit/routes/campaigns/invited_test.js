import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Invited', function (hooks) {
  setupTest(hooks);

  let route, campaign;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:campaigns.invited');
    route.modelFor = sinon.stub();
    route.router = { replaceWith: sinon.stub(), transitionTo: sinon.stub() };
    route.campaignStorage = { get: sinon.stub() };
    route.session.requireAuthenticationAndApprovedTermsOfService = sinon.stub();
  });

  module('#beforeModel', function () {
    test('should redirect to entry point when /prescrit is directly set in the url', async function (assert) {
      //when
      await route.beforeModel({ from: null });

      //then
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entry-point');
      assert.ok(true);
    });

    test('should continue en entrance route when from is set', async function (assert) {
      //when
      await route.beforeModel({ from: 'campaigns.entry-point' });

      //then
      sinon.assert.notCalled(route.router.replaceWith);
      assert.ok(true);
    });
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
    module('reconciliation', function () {
      test('should redirect to reconciliation invited page when association is needed', async function (assert) {
        //given
        campaign = EmberObject.create({
          isReconciliationRequired: true,
        });

        route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(false);

        //when
        await route.afterModel(campaign);

        //then
        const expectedResult = route.router.replaceWith.calledWithExactly(
          'campaigns.invited.reconciliation',
          campaign.code,
        );
        assert.true(expectedResult);
      });

      test('should redirect to fill in participant external page when association is already done', async function (assert) {
        //given
        campaign = EmberObject.create({
          isReconciliationRequired: true,
        });

        route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(true);

        //when
        await route.afterModel(campaign);

        //then
        const expectedResult = route.router.replaceWith.calledWithExactly(
          'campaigns.invited.fill-in-participant-external-id',
          campaign.code,
        );
        assert.true(expectedResult);
      });
    });

    module('student sco', function () {
      test('should redirect student sco invited page when association is needed', async function (assert) {
        //given
        campaign = EmberObject.create({
          isRestricted: true,
          isOrganizationSCO: true,
        });
        route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(false);

        //when
        await route.afterModel(campaign);

        //then
        const expectedResult = route.router.replaceWith.calledWithExactly(
          'campaigns.invited.student-sco',
          campaign.code,
        );
        assert.true(expectedResult);
      });

      test('should redirect to fill in participant external page when association is already done', async function (assert) {
        //given
        campaign = EmberObject.create({
          isRestricted: true,
          isOrganizationSCO: true,
        });
        route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(true);

        //when
        await route.afterModel(campaign);

        //then
        const expectedResult = route.router.replaceWith.calledWithExactly(
          'campaigns.invited.fill-in-participant-external-id',
          campaign.code,
        );
        assert.true(expectedResult);
      });
    });

    module('student sup', function () {
      test('should redirect student sup invited page when association is needed', async function (assert) {
        //given
        campaign = EmberObject.create({
          isRestricted: true,
          isOrganizationSUP: true,
        });
        route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(false);

        //when
        await route.afterModel(campaign);

        //then
        const expectedResult = route.router.replaceWith.calledWithExactly(
          'campaigns.invited.student-sup',
          campaign.code,
        );
        assert.true(expectedResult);
      });

      test('should redirect to fill in participant external page when association is already done', async function (assert) {
        //given
        campaign = EmberObject.create({
          isRestricted: true,
          isOrganizationSUP: true,
        });
        route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(true);

        //when
        await route.afterModel(campaign);

        //then
        const expectedResult = route.router.replaceWith.calledWithExactly(
          'campaigns.invited.fill-in-participant-external-id',
          campaign.code,
        );
        assert.true(expectedResult);
      });
    });

    test('should redirect to fill in participant external otherwise', async function (assert) {
      //given
      route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(false);
      campaign = EmberObject.create({
        isRestricted: false,
      });

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(
        route.router.replaceWith,
        'campaigns.invited.fill-in-participant-external-id',
        campaign.code,
      );
      assert.ok(true);
    });
  });
});
