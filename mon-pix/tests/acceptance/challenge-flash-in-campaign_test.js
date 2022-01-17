import { find } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import environment from '../../config/environment';

describe('Acceptance | Flash', () => {
  setupApplicationTest();
  setupMirage();
  let assessment;

  beforeEach(function () {
    assessment = server.create('assessment', 'ofFlashCampaignType');
  });

  describe('Campaign', () => {
    beforeEach(function () {
      // In reality we should have 48 challenges but we just use one in this test.
      server.create('challenge', 'forCampaign');
    });

    it('should display 1/48 counter on first challenge', async () => {
      // when
      await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      expect(find('.challenge__content')).to.exist;
      expect(find('.assessment-progress__value')).to.exist;

      const progressValue = find('.assessment-progress__value').textContent.replace(/\s+/g, '');
      const maxNbOfQuestions = environment.APP.NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD;
      expect(progressValue).to.equal(`1/${maxNbOfQuestions}`);
    });
  });
});
