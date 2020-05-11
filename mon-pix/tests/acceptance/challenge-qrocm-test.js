import { click, fillIn, find, findAll } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Displaying un QROCM', function() {
  setupApplicationTest();
  setupMirage();
  let assessment;
  let qrocmChallenge;

  beforeEach(async function() {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    qrocmChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCM');
  });

  context('Challenge answered: the answers inputs should be disabled', function() {
    beforeEach(async function() {
      server.create('answer', {
        value: 'logiciel1: \'Linux\'\nlogiciel2: \'Open Office\'\nlogiciel3: \'Pix\'\n',
        result: 'ko',
        challenge: qrocmChallenge,
        assessment,
      });

      await visit(`/assessments/${assessment.id}/challenges/${qrocmChallenge.id}`);
    });

    it('should fill inputs with previously given answer', async function() {
      expect(findAll('.challenge-response__proposal')[0].value).to.equal('Linux');
      expect(findAll('.challenge-response__proposal')[1].value).to.equal('Open Office');
      expect(findAll('.challenge-response__proposal')[2].value).to.equal('Pix');

      findAll('.challenge-response__proposal').forEach((input) => expect(input.disabled).to.equal(true));
    });

  });

  context('Challenge not answered', function() {
    beforeEach(async function() {
      await visit(`/assessments/${assessment.id}/challenges/${qrocmChallenge.id}`);
    });

    it('should render the challenge instruction', function() {
      expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(qrocmChallenge.instruction);
    });

    it('should display several inputs as proposal to user', function() {
      expect(findAll('.challenge-response__proposal')).to.have.lengthOf(3);
    });

    it('should display an error alert if the user tries to validate before filling all answer fields', async function() {
      await fillIn(findAll('input')[0], 'ANSWER');
      await fillIn(findAll('input')[1], 'ANSWER');
      await fillIn(findAll('input')[2], '');

      await click(find('.challenge-actions__action-validate'));

      expect(find('.alert')).to.exist;
      expect(find('.alert').textContent.trim()).to.equal('Pour valider, veuillez remplir tous les champs réponse. Sinon, passer.');
    });
  });

});
