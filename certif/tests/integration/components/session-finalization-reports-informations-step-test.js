import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

module('Integration | Component | session-finalization-reports-informations-step', function(hooks) {
  setupRenderingTest(hooks);
  let reportA;
  let reportB;

  hooks.beforeEach(async function() {
    const store = this.owner.lookup('service:store');
    reportA = run(() => store.createRecord('certification-report', {
      id: 1,
      firstName: 'Alice',
      lastName: 'Alister',
      certificationCourseId: 1234,
      examinerComment: 'commentaire surveillant',
      hasSeenEndTestScreen: null,
    }));
    reportB = run(() => store.createRecord('certification-report', {
      id: 2,
      firstName: 'Bob',
      lastName: 'Bober',
      certificationCourseId: 3,
      examinerComment: null,
      hasSeenEndTestScreen: true,
    }));
    this.set('certificationReports', [reportA, reportB]);

    await render(hbs`
      <SessionFinalizationReportsInformationsStep
        @certificationReports={{this.certificationReports}}
      />
    `);
  });

  test('it renders', function(assert) {
    assert.dom(`[data-test-id="finalization-report-last-name_${reportA.id}"]`).hasText(reportA.lastName);
    assert.dom(`[data-test-id="finalization-report-first-name_${reportA.id}"]`).hasText(reportA.firstName);
    assert.dom(`[data-test-id="finalization-report-certification-number_${reportA.id}"]`).hasText(reportA.id);
    assert.dom(`[data-test-id="finalization-report-last-name_${reportB.id}"]`).hasText(reportB.lastName);
    assert.dom(`[data-test-id="finalization-report-first-name_${reportB.id}"]`).hasText(reportB.firstName);
    assert.dom(`[data-test-id="finalization-report-certification-number_${reportB.id}"]`).hasText(reportB.id);
  });

  test('it fills in the examinerComment', async function(assert) {
    const examinerComment = 'This is an examiner comment !';
    await fillIn(`[data-test-id="finalization-report-examiner-comment_${reportA.id}"]`, examinerComment);

    assert.equal(reportA.examinerComment, examinerComment);
  });

  test('it checks the checkboxes', async function(assert) {
    await click(`[data-test-id="finalization-report-has-seen-end-test-screen_${reportA.id}"]`);

    assert.equal(find(`[data-test-id="finalization-report-has-seen-end-test-screen_${reportA.id}"]`).classList.toString(),
      ['checkbox', 'checkbox--checked'].join(' '));
    assert.equal(reportA.hasSeenEndTestScreen, true);
  });

  test('it checks all the checkboxes that can be checked using the check all options', async function(assert) {
    await click('.session-finalization-reports-informations-step__checker');

    assert.equal(find(`[data-test-id="finalization-report-has-seen-end-test-screen_${reportA.id}"]`).classList.toString(),
      ['checkbox', 'checkbox--checked'].join(' '));
    assert.equal(find(`[data-test-id="finalization-report-has-seen-end-test-screen_${reportB.id}"]`).classList.toString(),
      ['checkbox', 'checkbox--checked'].join(' '));
    assert.equal(reportA.hasSeenEndTestScreen, true);
    assert.equal(reportB.hasSeenEndTestScreen, true);
  });

});
