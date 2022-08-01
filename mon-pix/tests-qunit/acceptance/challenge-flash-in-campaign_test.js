import { find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import environment from '../../config/environment';

module('Acceptance | Flash', (hooks) => {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;

  hooks.beforeEach(function () {
    assessment = server.create('assessment', 'ofFlashCampaignType');
  });

  module('Campaign', (hooks) => {
    hooks.beforeEach(function () {
      // In reality we should have 48 challenges but we just use one in this test.
      server.create('challenge', 'forCampaign');
    });

    test('should display 1/48 counter on first challenge', async (assert) => {
      // when
      await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      assert.dom(find('.challenge__content')).exists();
      assert.dom(find('.assessment-progress__value')).exists();

      const progressValue = find('.assessment-progress__value').textContent.replace(/\s+/g, '');
      const maxNbOfQuestions = environment.APP.NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD;
      assert.equal(progressValue, `1/${maxNbOfQuestions}`);
    });
  });
});
