import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

const FEEDBACK_FORM = '.feedback-panel__form';

describe('Acceptance | Signaler une épreuve', function() {

  let application;

  function assertThatFeedbackPanelExist() {
    expect(find('.feedback-panel')).to.have.lengthOf(1);
  }

  function assertThatFeedbackFormIsClosed() {
    expect(find('.feedback-panel__open-link')).to.have.lengthOf(1);
    expect(find(FEEDBACK_FORM)).to.have.lengthOf(0);
  }

  function assertThatFeedbackFormIsOpen() {
    expect(find('.feedback-panel__open-link')).to.have.lengthOf(0);
    expect(find(FEEDBACK_FORM)).to.have.lengthOf(1);
  }

  describe('l1.1 Depuis une epreuve', function() {

    beforeEach(function() {
      application = startApp();
    });

    afterEach(function() {
      destroyApp(application);
    });

    it('Je peux signaler une épreuve directement', async () => {
      await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
      assertThatFeedbackPanelExist();
    });

    it('Le formulaire de signalement d\'une épreuve est remis à zéro dès que je change d\'épreuve', async () => {
      await visit('/assessments/ref_assessment_id/challenges/ref_qru_challenge_id');
      assertThatFeedbackFormIsClosed();

      await click('.feedback-panel__open-link');
      assertThatFeedbackFormIsOpen();

      await click('.challenge-actions__action-skip');
      assertThatFeedbackFormIsClosed();
    });

    it('Le formulaire de signalement est remis à zéro même quand les 2 épreuves qui s\'enchaînent utilisent le même composant challenge-item-* (ex : q1 est de type "QCU" et q2 "QRU" ; toutes deux utilisent le composant challenge-item-qcu)', async () => {
      // In our Mirage data set, in the "ref course", the QCU challenge is followed by a QRU's one
      await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
      assertThatFeedbackFormIsClosed();

      await click('.feedback-panel__open-link');
      assertThatFeedbackFormIsOpen();

      await click('.challenge-actions__action-skip');
      assertThatFeedbackFormIsClosed();
    });
  });

  describe('l1.2 Depuis la fenêtre de comparaison', function() {

    before(function() {
      application = startApp();
    });

    after(function() {
      destroyApp(application);
    });

    it('Je peux signaler une épreuve (page de résultat du test)', async () => {
      await visit('/assessments/ref_assessment_id/results/compare/ref_answer_qcm_id/1');
      assertThatFeedbackFormIsOpen();
    });

  });

});
