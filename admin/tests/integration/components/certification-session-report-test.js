import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certification-session-report', function(hooks) {

  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('visible', true);
    this.set('onHide', function() {});
    this.set('onGetJuryFile', function() {});
    this.set('onSaveCertificationsReportData', function() {});
    this.set('sessionId', '3');
    const buildCertification = function buildCertificationObject({
      id,
      firstName = 'default firstName',
      lastName = 'default lastName',
      birthdate = 'default birthdate',
      birthplace = 'default birtplace',
      examinerComment = '',
      hasSeenEndTestScreen = true,
      isInSession = true, }) {
      return {
        id, firstName, lastName, birthplace, birthdate, examinerComment, hasSeenEndTestScreen, isInSession
      };
    };
    const certifications = [
      buildCertification({ id: 1 }),
      buildCertification({ id: 2, birthdate: null }),
      buildCertification({ id: 3 }),
      buildCertification({ id: 3 }),
      buildCertification({ id: 4 }),
      buildCertification({ id: 4 }),
      buildCertification({ id: 5, isInSession: false }),
      buildCertification({ id: 6, firstName: 'Jean', lastName: 'Padansession', hasSeenEndTestScreen: false }),
      buildCertification({ id: 7, firstName: 'Jean', lastName: 'Palié', hasSeenEndTestScreen: false }),
      buildCertification({ id: 8, firstName: 'Jean', lastName: 'Lié', hasSeenEndTestScreen: false }),
      buildCertification({ id: 9, examinerComment: 'comment' }),
    ];
    certifications[7].hasSeenLastScreenFromPaperReportEnhanced = 'NOT_IN_SESSION';
    certifications[8].hasSeenLastScreenFromPaperReportEnhanced = 'NOT_LINKED';
    certifications[9].hasSeenLastScreenFromPaperReportEnhanced = 'LINKED';
    this.set('certificationsInSessionReport', certifications);
    return render(hbs`{{certification-session-report 
      show=visible hide=onHide onDownloadJuryFile=onGetJuryFile 
      onSaveSessionReportCertifications=onSaveCertificationsReportData certifications=certificationsInSessionReport}}`);
  });

  module('Rendering', function() {
    test('it renders', async function(assert) {
      // then
      assert.dom('.certification-session-report__body').exists();
    });
  });

  module('When given a list of certifications', function() {

    test('it counts and displays total number of certifications', async function(assert) {
      // when
      await click('.data-section--total-certifications .data-section__switch');

      // then
      assert.dom('.data-section--total-certifications .data-section__counter').hasText('11');
      const certificationsIdsElement = find('.data-section--total-certifications .data-section__certification-ids');
      const certificationIds = certificationsIdsElement.textContent.trim().replace(/\s/g, '');
      assert.equal(certificationIds, '12334456789');
    });

    test('it counts and displays incomplete certifications', async function(assert) {
      // when
      await click('.data-section--incomplete-certifications .data-section__switch');

      // then
      assert.dom('.data-section--incomplete-certifications .data-section__counter').hasText('1');
      const certificationsIdsElement = find('.data-section--incomplete-certifications .data-section__certification-ids');
      const certificationIds = certificationsIdsElement.textContent.trim().replace(/\s/g, '');
      assert.equal(certificationIds, '2');
    });

    test('it counts and displays duplicate certification ids', async function(assert) {
      // when
      await click('.data-section--duplicate-certification-ids .data-section__switch');

      // then
      assert.dom('.data-section--duplicate-certification-ids .data-section__counter').hasText('2');
      const certificationsIdsElement = find('.data-section--duplicate-certification-ids .data-section__certification-ids');
      const certificationIds = certificationsIdsElement.textContent.trim().replace(/\s/g, '');
      assert.equal(certificationIds, '34');
    });

    test('it counts and displays out of session certification ids', async function(assert) {
      // when
      await click('.data-section--out-of-session-certifications .data-section__switch');

      // then
      assert.dom('.data-section--out-of-session-certifications .data-section__counter').hasText('1');
      const certificationsIdsElement = find('.data-section--out-of-session-certifications .data-section__certification-ids');
      const certificationIds = certificationsIdsElement.textContent.trim().replace(/\s/g, '');
      assert.equal(certificationIds, '5');
    });

    module('on click on "Ecrans de fin de tests non vus"', function() {
      test('it counts has not seen last screen certifications', async function(assert) {
        // when
        await click('.data-section--has-not-seen-last-screen-certifications .data-section__switch');

        // then
        assert.dom('.data-section--has-not-seen-last-screen-certifications .data-section__counter').hasText('3');
      });
      test('it displays the ones that have no last screen seen and not in session in a specific way', async function(assert) {
        // when
        await click('.data-section--has-not-seen-last-screen-certifications .data-section__switch');

        // then
        const candidateElement = find('.data-section--has-not-seen-last-screen-certifications .data-section__candidate-names__not-in-session');
        const candidateNames = candidateElement.textContent.trim();
        assert.equal(candidateNames, 'Padansession Jean');
      });
      test('it displays the ones that have no last screen seen and not linked in a specific way', async function(assert) {
        // when
        await click('.data-section--has-not-seen-last-screen-certifications .data-section__switch');

        // then
        const candidateElement = find('.data-section--has-not-seen-last-screen-certifications .data-section__candidate-names__not-linked');
        const candidateNames = candidateElement.textContent.trim();
        assert.equal(candidateNames, 'Palié Jean');
      });
      test('it displays the ones that have no last screen seen and linked in a specific way', async function(assert) {
        // when
        await click('.data-section--has-not-seen-last-screen-certifications .data-section__switch');

        // then
        const candidateElement = find('.data-section--has-not-seen-last-screen-certifications .data-section__candidate-names__linked');
        const candidateNames = candidateElement.textContent.trim();
        assert.equal(candidateNames, 'Lié Jean');
      });
    });

    test('it counts and displays certification ids that have examiner comment', async function(assert) {
      // when
      await click('.data-section--has-examiner-comment-screen-certifications .data-section__switch');

      // then
      assert.dom('.data-section--has-examiner-comment-screen-certifications .data-section__counter').hasText('1');
      const certificationsIdsElement = find('.data-section--has-examiner-comment-screen-certifications .data-section__certification-ids');
      const certificationIds = certificationsIdsElement.textContent.trim().replace(/\s/g, '');
      assert.equal(certificationIds, '9');
    });
  });
});
