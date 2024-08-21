import { clickByText, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { setupApplicationTest, t } from '../helpers';
import identifyLearner from '../helpers/identify-learner';

module('Acceptance | Start mission', function (hooks) {
  setupApplicationTest(hooks);

  module('When there is no introduction media', function () {
    test('redirect to first challenge page after clicking on start mission', async function (assert) {
      // given
      identifyLearner(this.owner);
      const mission = this.server.create('mission');
      this.server.create('challenge');

      // when
      try {
        await visit(`/missions/${mission.id}`);
        await clickByText(t('pages.missions.start-page.start-mission'));
      } catch (error) {
        const { message } = error;
        if (message !== 'TransitionAborted') {
          throw error;
        }
      }
      // then
      assert.strictEqual(currentURL(), `/assessments/1/challenges`);
    });
  });

  module('When there is an introduction media', function () {
    test('redirect to introduction page', async function (assert) {
      // given
      identifyLearner(this.owner);
      const mission = this.server.create('mission', {
        introductionMediaUrl: 'www.example.net',
        introductionMediaType: 'image',
        introductionMediaAlt: 'image de présentations',
      });
      this.server.create('challenge');

      // when
      try {
        await visit(`/missions/${mission.id}`);
        await clickByText(t('pages.missions.start-page.start-mission'));
      } catch (error) {
        const { message } = error;
        if (message !== 'TransitionAborted') {
          throw error;
        }
      }
      // then
      assert.strictEqual(currentURL(), `/missions/1/introduction`);
    });
    test('redirect to first challenge after clicking on start mission', async function (assert) {
      // given
      identifyLearner(this.owner);
      const mission = this.server.create('mission', {
        introductionMediaUrl: 'www.example.net',
        introductionMediaType: 'image',
        introductionMediaAlt: 'image de présentations',
      });
      this.server.create('challenge');

      // when
      try {
        await visit(`/missions/${mission.id}/introduction`);
        await clickByText(t('pages.missions.introduction-page.start-mission'));
      } catch (error) {
        const { message } = error;
        if (message !== 'TransitionAborted') {
          throw error;
        }
      }
      // then
      assert.strictEqual(currentURL(), '/assessments/1/challenges');
    });
  });
});
