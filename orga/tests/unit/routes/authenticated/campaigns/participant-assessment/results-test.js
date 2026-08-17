import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module(
  'Unit | Route | authenticated/campaigns/{campaignId}/evaluation/{campaignParticipationId}/resultats',
  function (hooks) {
    setupTest(hooks);

    module('Before model', function () {
      module('When places limit is reached', function () {
        test('should redirect on main campaign page', function (assert) {
          //given
          const route = this.owner.lookup('route:authenticated/campaigns/participant-assessment/results');
          const campaignId = Symbol('CampaignId');

          const modelForStub = sinon.stub(route, 'modelFor');
          const replaceWithStub = sinon.stub(route.router, 'replaceWith');

          modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: true });

          //when
          route.beforeModel({ to: { params: { campaign_id: campaignId } } });

          //then
          assert.ok(replaceWithStub.calledWithExactly('authenticated.campaigns.campaign', campaignId));
        });
      });

      module('When places limit is not reached', function () {
        test('should not redirect on main campaign page', function (assert) {
          //given
          const route = this.owner.lookup('route:authenticated/campaigns/participant-assessment/results');
          const campaignId = Symbol('CampaignId');

          const modelForStub = sinon.stub(route, 'modelFor');
          const replaceWithStub = sinon.stub(route.router, 'replaceWith');

          modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: false });

          //when
          route.beforeModel({ to: { params: { campaign_id: campaignId } } });

          //then
          assert.notOk(replaceWithStub.called);
        });
      });
    });

    module('model', function () {
      module('when participation is not shared', function () {
        test('it should return an empty array without calling the API', async function (assert) {
          //given
          const route = this.owner.lookup('route:authenticated/campaigns/participant-assessment/results');

          sinon
            .stub(route, 'modelFor')
            .withArgs('authenticated.campaigns.participant-assessment')
            .returns({
              campaignAssessmentParticipation: {
                isShared: false,
              },
            });

          //when
          const result = await route.model();

          //then
          assert.deepEqual(result, []);
        });
      });

      module('when participation is shared', function () {
        test('it should return competence results', async function (assert) {
          //given
          const route = this.owner.lookup('route:authenticated/campaigns/participant-assessment/results');
          const competenceResults = [Symbol('result1'), Symbol('result2')];

          sinon
            .stub(route, 'modelFor')
            .withArgs('authenticated.campaigns.participant-assessment')
            .returns({
              campaignAssessmentParticipation: {
                isShared: true,
                campaignAssessmentParticipationResult: Promise.resolve({
                  competenceResults: Promise.resolve(competenceResults),
                }),
              },
            });

          //when
          const result = await route.model();

          //then
          assert.deepEqual(result, competenceResults);
        });
      });
    });
  },
);
