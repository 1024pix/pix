import { find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Download an attachment from a challenge', function() {
  setupApplicationTest();
  setupMirage();
  let challengeWithAttachment;
  let challengeWithNoAttachment;
  let assessment;

  beforeEach(function() {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    challengeWithAttachment = server.create('challenge', 'forCompetenceEvaluation', 'withAttachment');
    challengeWithNoAttachment = server.create('challenge', 'forCompetenceEvaluation');
  });

  describe('When the challenge has an attachment', function() {

    beforeEach(async function() {
      await visit(`/assessments/${assessment.id}/challenges/${challengeWithAttachment.id}`);
    });

    it('should have a way to download the attachment', function() {
      expect(find('.challenge-statement__action-link')).to.exist;
    });

    it('should expose the correct attachment link', function() {
      expect(find('.challenge-statement__action-link').textContent).to.contain('Télécharger');
      expect(challengeWithAttachment.attachments.length).to.equal(1);
      expect(find('.challenge-statement__action-link').getAttribute('href')).to.equal(challengeWithAttachment.attachments[0]);
    });

    it('should only have one file downloadable', function() {
      expect(find('.challenge-statement__action-link')).to.exist;
    });
  });

  describe('When the challenge does not contain an attachment', function() {

    beforeEach(async function() {
      await visit(`/assessments/${assessment.id}/challenges/${challengeWithNoAttachment.id}`);
    });

    it('should hide the download section for the attachment', function() {
      // We are in a challenge...
      expect(find('.challenge-item')).to.exist;

      // ... but attachment is hidden
      expect(find('.challenge-statement__action-link')).not.to.exist;
    });
  });

});
