import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/campaign/activity', function (hooks) {
  setupTest(hooks);
  let route, store;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/campaigns/campaign/activity');
    store = this.owner.lookup('service:store');
  });

  module('model', function () {
    test('should fetch data', async function (assert) {
      //given
      const campaignId = Symbol('CampaignId');
      const pageNumber = Symbol('pageNumber');
      const pageSize = Symbol('pageSize');
      const divisions = Symbol('divisions');
      const status = Symbol('status');
      const groups = Symbol('groups');
      const search = Symbol('search');
      const participantExternalId = Symbol('participantExternalId');
      const params = {
        campaignId,
        pageNumber,
        pageSize,
        divisions,
        status,
        groups,
        search,
        participantExternalId,
      };

      const campaign = { id: campaignId };
      const modelForStub = sinon.stub(route, 'modelFor');
      modelForStub.withArgs('authenticated.campaigns.campaign').returns(campaign);
      const participationsSymbol = Symbol('CampaignParticipations');
      sinon
        .stub(store, 'query')
        .withArgs('campaign-participant-activity', {
          campaignId,
          page: { number: pageNumber, size: pageSize },
          filter: {
            divisions,
            status,
            groups,
            search,
            participantExternalId,
          },
        })
        .resolves(participationsSymbol);
      //when
      const result = await route.model(params);

      //then
      assert.deepEqual(result, { campaign: campaign, participations: participationsSymbol });
    });
  });

  module('resetController', function () {
    test('it should call resetFiltering method on controller, if isExiting is true', function (assert) {
      const controller = {
        resetFiltering: sinon.stub(),
      };
      const isExiting = true;

      route.resetController(controller, isExiting);
      assert.ok(controller.resetFiltering.calledOnce);
    });
    test('it should not call resetFiltering method on controller, if isExiting is false', function (assert) {
      const controller = {
        resetFiltering: sinon.stub(),
      };
      const isExiting = false;

      route.resetController(controller, isExiting);
      assert.ok(controller.resetFiltering.notCalled);
    });
  });

  module('refreshModel', function () {
    test('it should also call reload on parent model', function (assert) {
      const reloadStub = sinon.stub();
      sinon.stub(route, 'modelFor').returns({ reload: reloadStub });
      route.refreshModel();
      assert.ok(reloadStub.calledOnce);
    });
  });
});
