import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | 4 - Démarrer une épreuve |', function() {

  const propositions = [
    'proposition 1', 'proposition 2', 'proposition 3'
  ];
  let application;
  let assessment;
  let challenge;
  let course;

  before(function() {
    application = startApp();
    challenge = server.create('challenge-airtable');
    challenge.attrs.fields['Propositions'] = propositions.map((p) => `- ${p}`).reduce((e1, e2) => `${e1}\n${e2}`);
    course = server.create('course-airtable');
    course.fields['Épreuves'] = [ challenge.attrs.id ];
    assessment = server.create('assessment-airtable');
    assessment.fields['Test'] = [ course.attrs.id ];
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/assessments/${assessment.attrs.id}/challenges/${challenge.attrs.id}`);
  });

  it('4.1. doit être sur l\'URL /assessments/:assessment_id/challenges/:challenge_id', function () {
    expect(currentURL()).to.equal(`/assessments/${assessment.attrs.id}/challenges/${challenge.attrs.id}`);
  });

  describe('Les informations visibles pour une épreuve de type QCU sont :', function () {

    it('4.2. la consigne de l\'épreuve', function () {
      const $instruction = findWithAssert('.challenge-instruction');
      expect($instruction.text()).to.contains(challenge.attrs.fields['Consigne']);
    });

    it('4.3. les propositions de l\'épreuve', function () {
      const $proposals = findWithAssert('.challenge-proposal');
      expect($proposals).to.have.lengthOf(3);
      expect($proposals.eq(0).text()).to.contains(propositions[0]);
      expect($proposals.eq(1).text()).to.contains(propositions[1]);
      expect($proposals.eq(2).text()).to.contains(propositions[2]);
    });

  });

  it('4.4. affiche le bouton "Valider" permettant de sauvegarder la réponse saisie et de passer à l\'épreuve suivante ', function() {
    expect(findWithAssert('.validate-button').text()).to.eq('Valider');
  });

  it('4.5. affiche le bouton "Passer" permettant de passer à l\'épreuve suivante sans avoir saisi de réponse', function() {
    expect(findWithAssert('.skip-button').text()).to.eq('Passer');
  });
});
