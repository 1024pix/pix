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
    "J’ai déposé le document ici : P: > Equipe > Communication > Textes > intro.odt",
    "Ci-joint le document que j’ai déposé dans l’espace partagé",
    "J’ai déposé le document intro.odt dans l’espace partagé",
    "J’ai déposé un nouveau document dans l’espace partagé, si tu ne le trouves pas je te l’enverrai par mail"
  ];
  let application;
  let challenge;

  before(function() {
    application = startApp();
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/assessments/an_assessment_id/challenges/qcu_challenge_id`);
  });

  describe('Les informations visibles pour une épreuve de type QCU sont :', function () {

    it('4.2. la consigne de l\'épreuve', function () {
      const $instruction = findWithAssert('.challenge-instruction');
      expect($instruction.text()).to.contain('Julie a déposé un document dans un espace de stockage partagé avec Pierre. Elle lui envoie un mail pour l’en informer. Quel est le meilleur message ?');
    });

    it('4.3. les propositions de l\'épreuve', function () {
      const $proposals = findWithAssert('.challenge-proposal');
      expect($proposals).to.have.lengthOf(4);
      expect($proposals.eq(0).text()).to.contains(propositions[0]);
      expect($proposals.eq(1).text()).to.contains(propositions[1]);
      expect($proposals.eq(2).text()).to.contains(propositions[2]);
    });

  });

  it('4.4. affiche le bouton "Valider" permettant de sauvegarder la réponse saisie et de passer à l\'épreuve suivante ', function() {
    expect(findWithAssert('a.challenge-item-actions__validate-action').text()).to.contains('Je valide');
  });

  it('4.5. affiche le bouton "Passer" permettant de passer à l\'épreuve suivante sans avoir saisi de réponse', function() {
    expect(findWithAssert('a.challenge-item-actions__skip-action').text()).to.contains('Je passe');
  });

});
