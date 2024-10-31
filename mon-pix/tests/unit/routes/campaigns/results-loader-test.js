import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Campaigns | Results-loader', function (hooks) {
  setupTest(hooks);

  let route, campaign, campaignParticipation;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:campaigns.results-loader');
    route.router = { replaceWith: sinon.stub() };
  });

  module('#afterModel', function () {
    test('should redirect campaign landing page if campaignParticipation does not exist', async function (assert) {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
      });
      campaignParticipation = null;

      //when
      await route.afterModel({ campaign, campaignParticipation });

      //then
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.campaign-landing-page', campaign.code);
      assert.ok(true);
    });

    test('should redirect to results page if campaignParticipation is shared', async function (assert) {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
      });
      campaignParticipation = EmberObject.create({
        isShared: true,
      });

      //when
      await route.afterModel({ campaign, campaignParticipation });

      //then
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.assessment.results', campaign.code);
      assert.ok(true);
    });

    test('should redirect to start or resume page if assessment is not completed', async function (assert) {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
      });
      campaignParticipation = EmberObject.create({
        sharedAt: null,
        assessment: EmberObject.create({
          isCompleted: false,
        }),
      });

      //when
      await route.afterModel({ campaign, campaignParticipation });

      //then
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.assessment.start-or-resume', campaign.code);
      assert.ok(true);
    });
  });
});
