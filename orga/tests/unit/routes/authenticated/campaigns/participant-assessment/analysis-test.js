import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module(
  'Unit | Route | authenticated/campaigns/{campaignId}/evaluation/{campaignParticipationId}/analyse',
  function (hooks) {
    setupTest(hooks);

    module('before model', function () {
      module('When places limit is reached', function () {
        test('should redirect on main campaign page', function (assert) {
          //given
          const route = this.owner.lookup('route:authenticated/campaigns/participant-assessment/analysis');
          const campaignId = Symbol('CampaignId');

          const modelForStub = sinon.stub(route, 'modelFor');
          const replaceWithStub = sinon.stub(route.router, 'replaceWith');

          modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: true });

          //when
          route.beforeModel({
            to: {
              parent: {
                params: {
                  campaign_id: campaignId,
                },
              },
            },
          });

          //then
          assert.ok(replaceWithStub.calledWithExactly('authenticated.campaigns.campaign', campaignId));
        });
      });

      module('When places limit is not reached', function () {
        test('should redirect to competences page', function (assert) {
          //given
          const route = this.owner.lookup('route:authenticated/campaigns/participant-assessment/analysis');
          const campaignId = Symbol('CampaignId');

          const modelForStub = sinon.stub(route, 'modelFor');
          const replaceWithStub = sinon.stub(route.router, 'replaceWith');

          modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: false });

          //when
          route.beforeModel({
            to: {
              name: 'maRoute.competences',
              parent: {
                params: {
                  campaign_id: campaignId,
                },
              },
            },
          });

          //then
          assert.ok(
            replaceWithStub.calledWithExactly('authenticated.campaigns.participant-assessment.analysis.competences'),
          );
        });

        test('should redirect to tubes page', function (assert) {
          //given
          const route = this.owner.lookup('route:authenticated/campaigns/participant-assessment/analysis');
          const campaignId = Symbol('CampaignId');

          const modelForStub = sinon.stub(route, 'modelFor');
          const replaceWithStub = sinon.stub(route.router, 'replaceWith');

          modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: false });

          //when
          route.beforeModel({
            to: {
              name: 'maRoute.test',
              parent: {
                params: {
                  campaign_id: campaignId,
                },
              },
            },
          });

          //then
          assert.ok(replaceWithStub.calledWithExactly('authenticated.campaigns.participant-assessment.analysis.tubes'));
        });
      });
    });

    module('model', function () {
      module('campaignAssessmentParticipation is shared', function (hooks) {
        let route;
        hooks.beforeEach(function () {
          route = this.owner.lookup('route:authenticated/campaigns/participant-assessment/analysis');
          sinon
            .stub(route, 'modelFor')
            .withArgs('authenticated.campaigns.participant-assessment')
            .returns({
              campaignAssessmentParticipation: {
                isShared: true,
                campaignParticipationLevelsPerTubesAndCompetence: Promise.resolve({}),
              },
            });
        });
        test('it should return model', async function (assert) {
          const result = await route.model();
          assert.ok(result.analysisData);
        });
        test('it should return isAnalysisAvailable to true', async function (assert) {
          const result = await route.model();
          assert.true(result.isAnalysisAvailable);
        });
        test('it should return isForParticipant to true', async function (assert) {
          const result = await route.model();
          assert.true(result.isForParticipant);
        });
      });
      module('campaignAssessmentParticipation is not shared', function (hooks) {
        let route;
        hooks.beforeEach(function () {
          route = this.owner.lookup('route:authenticated/campaigns/participant-assessment/analysis');
          sinon
            .stub(route, 'modelFor')
            .withArgs('authenticated.campaigns.participant-assessment')
            .returns({
              campaignAssessmentParticipation: {
                isShared: false,
              },
            });
        });
        test('it should return null analysisData', async function (assert) {
          const result = await route.model();
          assert.strictEqual(result.analysisData, null);
        });
        test('it should return isAnalysisAvailable to false', async function (assert) {
          const result = await route.model();
          assert.false(result.isAnalysisAvailable);
        });
        test('it should return isForParticipant to true', async function (assert) {
          const result = await route.model();
          assert.true(result.isForParticipant);
        });
      });
    });
  },
);
