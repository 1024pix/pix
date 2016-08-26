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

  let application;
  const assessmentId = 'appHAIFk9u1qqglhX';
  const challengeId = 'recLt9uwa2dR3IYpi';

  before(function() {
    application = startApp();
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/assessments/${assessmentId}/challenges/${challengeId}`);
  });

  it('4.1. doit être sur l\'URL /assessments/:assessment_id/challenges/:challenge_id', function () {
    expect(currentURL()).to.equal(`/assessments/${assessmentId}/challenges/${challengeId}`);
  });

  describe('Les informations visibles pour une épreuve de type QCU sont :', function () {

    it('4.2. la consigne de l\'épreuve', function () {
      const $instruction = findWithAssert('.challenge-instruction');
      expect($instruction.text()).to.contains("Que peut-on dire des œufs de catégorie A ?");
    });

    it('4.3. les propositions de l\'épreuve', function () {
      const $proposals = findWithAssert('.challenge-proposal');
      expect($proposals).to.have.lengthOf(5);
      expect($proposals.eq(0).text()).to.contains('Ils sont bio');
      expect($proposals.eq(1).text()).to.contains('Ils pèsent plus de 63 grammes');
      expect($proposals.eq(2).text()).to.contains('Ce sont des oeufs frais');
      expect($proposals.eq(3).text()).to.contains('Ils sont destinés aux consommateurs');
      expect($proposals.eq(4).text()).to.contains('Ils ne sont pas lavés');
    });

  });

  it('4.4. affiche le bouton "Valider" permettant de sauvegarder la réponse saisie et de passer à l\'épreuve suivante ', function() {
    expect(findWithAssert('.validate-button').text()).to.eq('Valider');
  });

  it('4.5. affiche le bouton "Passer" permettant de passer à l\'épreuve suivante sans avoir saisi de réponse', function() {
    expect(findWithAssert('.skip-button').text()).to.eq('Passer');
  });
});
