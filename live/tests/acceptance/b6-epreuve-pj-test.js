import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | b6 - Télécharger une pièce jointe depuis la consigne d\'une épreuve | ', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe('Quand l\'épreuve contient une pièce jointe en consigne', function () {

    before(function () {
      return visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
    });

    it('b6.1 Il existe un moyen pour télécharger la pièce jointe d\'une épreuve dans la zone de consigne', function () {
      const $attachmentLink = findWithAssert('.challenge-statement__action-link');
      expect($attachmentLink.length).to.equal(1);
    });

    it('b6.2 Le lien de la pièce jointe pointe vers le bon lien', function () {
      const $attachmentLink = $('.challenge-statement__action-link');
      expect($attachmentLink.text()).to.contains('Télécharger');
      expect($attachmentLink.attr('href')).to.equal('http://example_of_url');
    });

    it('b6.3 Il n\'y a qu\'un seul fichier téléchargeable', function () {
      const $attachment = findWithAssert('.challenge-statement__action-link');
      expect($attachment.length).to.equal(1);
    });
  });

  describe('Quand l\'épreuve ne contient pas de pièce jointe en consigne', function () {

    before(function () {
      return visit('/assessments/raw_assessment_id/challenges/raw_qcm_challenge_id');
    });

    it('b6.4 La section de téléchargement des pièces jointes est cachée', function() {
      // We are in a challenge...
      findWithAssert('.challenge-item');

      // ... but attachment is hidden
      const $attachmentLink = $('.challenge-statement__action-link');
      expect($attachmentLink.length).to.equal(0);
    });
  });

});
