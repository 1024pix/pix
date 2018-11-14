import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import $ from 'jquery';

function visitTimedChallenge() {
  visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  click('.challenge-item-warning button');
}

describe('Acceptance | Télécharger une pièce jointe depuis la consigne d\'une épreuve', function() {

  let application;

  const $ATTACHMENT_LINK = $('.challenge-statement__action-link');

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Quand l\'épreuve contient une pièce jointe en consigne', function() {

    beforeEach(function() {
      visitTimedChallenge();
    });

    it('Il existe un moyen pour télécharger la pièce jointe d\'une épreuve dans la zone de consigne', function() {
      const $ATTACHMENT_LINK = findWithAssert('.challenge-statement__action-link');
      expect($ATTACHMENT_LINK.length).to.equal(1);
    });

    it('Le lien de la pièce jointe pointe vers le bon lien', function() {
      const $ATTACHMENT_LINK = $('.challenge-statement__action-link');
      expect($ATTACHMENT_LINK.text()).to.contain('Télécharger');
      expect($ATTACHMENT_LINK.attr('href')).to.equal('http://example_of_url');
    });

    it('Il n\'y a qu\'un seul fichier téléchargeable', function() {
      const $attachment = findWithAssert('.challenge-statement__action-link');
      expect($attachment.length).to.equal(1);
    });
  });

  describe('Quand l\'épreuve ne contient pas de pièce jointe en consigne', function() {

    beforeEach(function() {
      visit('/assessments/ref_assessment_id/challenges/ref_qroc_challenge_id');
    });

    it('La section de téléchargement des pièces jointes est cachée', function() {
      // We are in a challenge...
      findWithAssert('.challenge-item');

      // ... but attachment is hidden
      expect($ATTACHMENT_LINK.length).to.equal(0);
    });
  });

});
