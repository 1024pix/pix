import { click, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

async function visitTimedChallenge() {
  await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  await click('.challenge-item-warning button');
}

describe('Acceptance | Download an attachment from a challenge', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  describe('When the challenge has an attachment', function() {

    beforeEach(async function() {
      await visitTimedChallenge();
    });

    it('should have a way to download the attachment', function() {
      expect(find('.challenge-statement__action-link')).to.exist;
    });

    it('should expose the correct attachment link', function() {
      expect(find('.challenge-statement__action-link').textContent).to.contain('Télécharger');
      expect(find('.challenge-statement__action-link').getAttribute('href')).to.equal('http://example_of_url');
    });

    it('should only have one file downloadable', function() {
      expect(find('.challenge-statement__action-link')).to.exist;
    });
  });

  describe('When the challenge does not contain an attachment', function() {

    beforeEach(async function() {
      await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qroc_challenge_id');
    });

    it('should hide the download section for the attachment', function() {
      // We are in a challenge...
      expect(find('.challenge-item')).to.exist;

      // ... but attachment is hidden
      expect(find('.challenge-statement__action-link')).not.to.exist;
    });
  });

});
