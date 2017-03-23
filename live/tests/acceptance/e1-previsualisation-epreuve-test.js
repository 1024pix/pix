import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { resetTestingState } from '../helpers/shared-state';
import _ from 'pix-live/utils/lodash-custom';

describe('Acceptance | e1 - Prévisualiser une épreuve | ', function () {

  let application;

  beforeEach(function () {
    application = startApp();
  });

  afterEach(function () {
    destroyApp(application);
  });

  describe('e1 - Prévisualiser une épreuve | ', function () {

    beforeEach(function () {
      // localStorage.clear();
      resetTestingState();
      visit('/');
    });

    it('e1.1 Il y a une demande de création d\'un assessment avec un course vide', async function () {
      // Given
      let postOnAssessment = localStorage.getItem('POST_ON_URL_/assessments');
      expect(postOnAssessment).not.to.exist;

      // When
      await visit('/challenges/ref_qcu_challenge_id/preview');

      // Then
      postOnAssessment = localStorage.getItem('POST_ON_URL_/assessments');
      expect(postOnAssessment).to.exist;
      const postOnAssessmentObj = JSON.parse(postOnAssessment);
      expect(typeof postOnAssessment).to.equal('string');
      expect(typeof postOnAssessmentObj).to.equal('object');
      expect(_.get(postOnAssessmentObj, 'data.type')).to.equal('assessments');
      const idFirstChars = _.get(postOnAssessmentObj, 'data.relationships.course.data.id').substring(0,4);
      expect(_.get(postOnAssessmentObj, 'data.relationships.course.data.type')).to.deep.equal('courses');
      expect(idFirstChars).to.equal('null');
    });

    it('e1.2 On affiche l\'assessment retourné par le serveur', async function () {

      // Given
      await visit('/challenges/ref_qcu_challenge_id/preview');
      expect(currentURL()).to.equal('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
      expect(findWithAssert('.assessment-challenge'));
    });

    it('e1.3 Il y a une demande de rafraichissement du cache des solutions', async function () {
      // Given
      let postOnAssessment = localStorage.getItem('POST_ON_URL_/challenges/ref_qcu_challenge_id/solution');
      expect(postOnAssessment).not.to.exist;

      // When
      await visit('/challenges/ref_qcu_challenge_id/preview');

      // Then
      postOnAssessment = localStorage.getItem('POST_ON_URL_/challenges/ref_qcu_challenge_id/solution');
      expect(postOnAssessment).to.exist;
    });

  });
});
