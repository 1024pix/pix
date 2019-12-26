import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

module('Integration | Component | session-finalization-candidates-informations-step', function(hooks) {
  setupRenderingTest(hooks);
  let candidateA;
  let candidateB;

  hooks.beforeEach(async function() {
    const store = this.owner.lookup('service:store');
    candidateA = run(() => store.createRecord('certification-candidate', {
      id: 1,
      firstName: 'Alice',
      lastName: 'Alister',
      certificationCourseId: 1234,
      examinerComment: null,
      hasSeenEndTestScreen: false,
    }));
    candidateB = run(() => store.createRecord('certification-candidate', {
      id: 2,
      firstName: 'Bob',
      lastName: 'Bober',
      certificationCourseId: undefined,
      examinerComment: null,
      hasSeenEndTestScreen: false,
    }));
    this.set('certificationCandidates', [candidateA, candidateB]);

    await render(hbs`
      <SessionFinalizationCandidatesInformationsStep
        @certificationCandidates={{this.certificationCandidates}}
      />
    `);
  });

  test('it renders', function(assert) {
    assert.dom(`[data-test-id="finalization-candidate-last-name_${candidateA.id}"]`).hasText(candidateA.lastName);
    assert.dom(`[data-test-id="finalization-candidate-first-name_${candidateA.id}"]`).hasText(candidateA.firstName);
    assert.dom(`[data-test-id="finalization-candidate-certification-number_${candidateA.id}"]`).hasText(candidateA.certificationCourseIdReadable);
    assert.dom(`[data-test-id="finalization-candidate-last-name_${candidateB.id}"]`).hasText(candidateB.lastName);
    assert.dom(`[data-test-id="finalization-candidate-first-name_${candidateB.id}"]`).hasText(candidateB.firstName);
    assert.dom(`[data-test-id="finalization-candidate-certification-number_${candidateB.id}"]`).hasText(candidateB.certificationCourseIdReadable);
  });

  test('it fills in the examinerComment', async function(assert) {
    const examinerComment = 'This is an examiner comment !';
    await fillIn(`[data-test-id="finalization-candidate-examiner-comment_${candidateA.id}"]`, examinerComment);

    assert.equal(candidateA.examinerComment, examinerComment);
  });

  test('it checks the checkboxes', async function(assert) {
    await click(`[data-test-id="finalization-candidate-has-seen-end-test-screen_${candidateA.id}"]`);

    assert.equal(find(`[data-test-id="finalization-candidate-has-seen-end-test-screen_${candidateA.id}"]`).classList.toString(),
      ['checkbox', 'checkbox--checked'].join(' '));
    assert.equal(candidateA.hasSeenEndTestScreen, true);
  });

  test('it checks all the checkboxes that can be checked using the check all options', async function(assert) {
    await click('.session-finalization-candidates-informations-step__checker');

    assert.equal(find(`[data-test-id="finalization-candidate-has-seen-end-test-screen_${candidateA.id}"]`).classList.toString(),
      ['checkbox', 'checkbox--checked'].join(' '));
    assert.equal(find(`[data-test-id="finalization-candidate-has-seen-end-test-screen_${candidateB.id}"]`).classList.toString(),
      ['checkbox', 'checkbox--unchecked', 'checkbox--disabled'].join(' '));
    assert.equal(candidateA.hasSeenEndTestScreen, true);
    assert.equal(candidateB.hasSeenEndTestScreen, false);
  });

});
