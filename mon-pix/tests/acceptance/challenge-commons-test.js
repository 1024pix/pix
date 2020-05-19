import { find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Common behavior to all challenges', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function() {
    user = server.create('user', 'withEmail');
    await authenticateByEmail(user);
  });

  context('Challenge answered: the answers inputs should be disabled', function() {
    beforeEach(async function() {
      const assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      const challenge = server.create('challenge', 'forCompetenceEvaluation');
      const answer = server.create('answer', 'skipped', { assessment, challenge });

      await visit(`/assessments/${answer.assessmentId}/challenges/${answer.challengeId}`);
    });

    it('should display the lock overlay', function() {
      expect(find('.challenge-response--locked')).to.exist;
    });

    it('should display the resume button and the information sentence', function() {
      expect(find('.challenge-actions__action-continue')).to.exist;
      expect(find('.challenge-actions__already-answered')).to.exist;
    });

  });

  context('Challenge not answered', function() {
    let assessment;
    let challenge;

    beforeEach(async function() {
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCM', { instruction: 'Instruction [lien](http://www.a.link.example.url)' });
      await visit(`/assessments/${assessment.id}/challenges/${challenge.id}`);
    });

    it('should display the name of the test', async function() {
      expect(find('.assessment-banner__title').textContent).to.contain(assessment.title);
    });

    it('should display the challenge instruction', function() {
      expect(find('.challenge-statement__instruction').textContent.trim()).to.equal('Instruction lien');
    });

    it('should format content written as [foo](bar) as clickable link', function() {
      expect(find('.challenge-statement__instruction a')).to.exist;
      expect(find('.challenge-statement__instruction a').textContent).to.equal('lien');
      expect(find('.challenge-statement__instruction a').getAttribute('href')).to.equal('http://www.a.link.example.url');
    });

    it('should open links in a new tab', function() {
      expect(find('.challenge-statement__instruction a').getAttribute('target')).to.equal('_blank');
    });

    it('should display the skip button', function() {
      expect(find('.challenge-actions__action-skip')).to.exist;
    });

    it('should display the validate button', function() {
      expect(find('.challenge-actions__action-skip')).to.exist;
    });

    it('should display a button to come back to the courses list', function() {
      expect(find('.assessment-banner__home-link')).to.exist;
    });

    it('should come back to the home route when the back button is clicked', async function() {
      expect(find('.assessment-banner__home-link').getAttribute('href')).to.equal('/');
    });

    it('should be able to send a feedback about the current challenge', function() {
      expect(find('.feedback-panel')).to.exist;
    });

  });

});
