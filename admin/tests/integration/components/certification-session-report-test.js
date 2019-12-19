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
      hasSeenLastScreen = true,
      isInSession = true, }) {
      return {
        id, firstName, lastName, birthplace, birthdate, examinerComment, hasSeenLastScreen, isInSession
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
      buildCertification({ id: 6, firstName: 'Jean', lastName: 'Dupont', hasSeenLastScreen: false }),
      buildCertification({ id: 7, examinerComment: 'comment' }),
    ];
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
      assert.dom('.data-section--total-certifications .data-section__counter').hasText('9');
      const certificationsIdsElement = find('.data-section--total-certifications .data-section__certification-ids');
      const certificationIds = certificationsIdsElement.textContent.trim().replace(/\s/g, '');
      assert.equal(certificationIds, '123344567');
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
      test('it counts and displays has not seen last screen certification ids', async function(assert) {
        // when
        await click('.data-section--has-not-seen-last-screen-certifications .data-section__switch');

        // then
        assert.dom('.data-section--has-not-seen-last-screen-certifications .data-section__counter').hasText('1');
        const candidateElement = find('.data-section--has-not-seen-last-screen-certifications .data-section__candidate-names');
        const candidateNames = candidateElement.textContent.trim();
        assert.equal(candidateNames, 'Dupont Jean');
      });
    });

    test('it counts and displays certification ids that have examiner comment', async function(assert) {
      // when
      await click('.data-section--has-examiner-comment-screen-certifications .data-section__switch');

      // then
      assert.dom('.data-section--has-examiner-comment-screen-certifications .data-section__counter').hasText('1');
      const certificationsIdsElement = find('.data-section--has-examiner-comment-screen-certifications .data-section__certification-ids');
      const certificationIds = certificationsIdsElement.textContent.trim().replace(/\s/g, '');
      assert.equal(certificationIds, '7');
    });
  });
});
