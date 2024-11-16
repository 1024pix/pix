import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../../../helpers/create-glimmer-component';

module('Unit | Component | Campaigns | Assessment | Results | Hero | Custom Organization Block', function (hooks) {
  setupTest(hooks);

  module('#customButtonUrl', function () {
    module('when there is no custom link', function () {
      test('should return null', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const component = createGlimmerComponent(
          'campaigns/assessment/results/evaluation-results-hero/custom-organization-block',
        );

        component.args.campaign = store.createRecord('campaign', {
          customResultPageButtonUrl: null,
          customResultPageButtonText: 'useless label',
        });

        // when
        const url = component.customButtonUrl;

        // then
        assert.strictEqual(url, null);
      });
    });

    module('when there is a custom link', function () {
      test('should return the custom link', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const component = createGlimmerComponent(
          'campaigns/assessment/results/evaluation-results-hero/custom-organization-block',
        );

        component.args.campaign = store.createRecord('campaign', {
          customResultPageButtonUrl: 'https://pix.org/',
          customResultPageButtonText: 'custom label',
        });
        component.args.campaignParticipationResult = store.createRecord('campaign-participation-result', {});

        // when
        const url = component.customButtonUrl;

        // then
        assert.strictEqual(url, 'https://pix.org/');
      });

      module('when there is a mastery rate', function () {
        test('should return the custom link with a rounded mastery percentage search param', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');

          const component = createGlimmerComponent(
            'campaigns/assessment/results/evaluation-results-hero/custom-organization-block',
          );

          component.args.campaign = store.createRecord('campaign', {
            customResultPageButtonUrl: 'https://pix.org/',
            customResultPageButtonText: 'custom label',
          });
          component.args.campaignParticipationResult = store.createRecord('campaign-participation-result', {
            masteryRate: 0.755,
          });

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(url, 'https://pix.org/?masteryPercentage=76');
        });
      });

      module('when there is an external id', function () {
        test('should return the custom link with external id search param', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');

          const component = createGlimmerComponent(
            'campaigns/assessment/results/evaluation-results-hero/custom-organization-block',
          );

          component.args.campaign = store.createRecord('campaign', {
            customResultPageButtonUrl: 'https://pix.org/',
            customResultPageButtonText: 'custom label',
          });
          component.args.campaignParticipationResult = store.createRecord('campaign-participation-result', {
            participantExternalId: 'externalId',
          });

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(url, 'https://pix.org/?externalId=externalId');
        });
      });

      module('when there is a stage', function () {
        test('should return the custom link with stage threshold search param', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');

          const component = createGlimmerComponent(
            'campaigns/assessment/results/evaluation-results-hero/custom-organization-block',
          );

          component.args.campaign = store.createRecord('campaign', {
            customResultPageButtonUrl: 'https://pix.org/',
            customResultPageButtonText: 'custom label',
          });
          const reachedStage = store.createRecord('reached-stage', {
            threshold: 5,
          });
          component.args.campaignParticipationResult = store.createRecord('campaign-participation-result', {
            reachedStage,
          });

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(url, 'https://pix.org/?stage=5');
        });
      });

      module('when there is all parameters', function () {
        test('should return the custom link with all parameters', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');

          const component = createGlimmerComponent(
            'campaigns/assessment/results/evaluation-results-hero/custom-organization-block',
          );

          component.args.campaign = store.createRecord('campaign', {
            customResultPageButtonUrl: 'https://pix.org/',
            customResultPageButtonText: 'custom label',
          });
          const reachedStage = store.createRecord('reached-stage', {
            threshold: 5,
          });
          component.args.campaignParticipationResult = store.createRecord('campaign-participation-result', {
            reachedStage,
            masteryRate: 0.75,
            participantExternalId: 'externalId',
          });

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(url, 'https://pix.org/?masteryPercentage=75&externalId=externalId&stage=5');
        });
      });
    });
  });
});
