import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

module('Integration | Component | session-finalization-candidates-informations-step', function(hooks) {
  setupRenderingTest(hooks);
  let candidateA;
  let candidateB;
  const updateCommentStub = sinon.stub();
  const toggleCandidateEndTestScreenStub = sinon.stub();
  const toggleAllCandidatesEndTestScreenStub = sinon.stub();

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
    this.set('updateCertificationCandidateExaminerComment', updateCommentStub);
    this.set('toggleCertificationCandidateHasSeenEndTestScreen', toggleCandidateEndTestScreenStub);
    this.set('toggleAllCertificationCandidatesHasSeenEndTestScreen', toggleAllCandidatesEndTestScreenStub);

    await render(hbs`
      <SessionFinalizationCandidatesInformationsStep
        @certificationCandidates={{this.certificationCandidates}}
        @updateCertificationCandidateExaminerComment={{this.updateCertificationCandidateExaminerComment}}
        @examinerCommentMaxLength=100
        @toggleCertificationCandidateHasSeenEndTestScreen={{this.toggleCertificationCandidateHasSeenEndTestScreen}}
        @toggleAllCertificationCandidatesHasSeenEndTestScreen={{this.toggleAllCertificationCandidatesHasSeenEndTestScreen}}
      />
    `);
  });

  test('it renders', function(assert) {
    assert.dom(`[data-test-id="finalization-candidate-last-name_${candidateA.id}"]`).hasText(candidateA.lastName);
    assert.dom(`[data-test-id="finalization-candidate-first-name_${candidateA.id}"]`).hasText(candidateA.firstName);
    assert.dom(`[data-test-id="finalization-candidate-certification-number_${candidateA.id}"]`).hasText(candidateA.readableCertificationCourseId);
    assert.dom(`[data-test-id="finalization-candidate-last-name_${candidateB.id}"]`).hasText(candidateB.lastName);
    assert.dom(`[data-test-id="finalization-candidate-first-name_${candidateB.id}"]`).hasText(candidateB.firstName);
    assert.dom(`[data-test-id="finalization-candidate-certification-number_${candidateB.id}"]`).hasText(candidateB.readableCertificationCourseId);
  });

  test('it calls the callback when examiner comment edited', async function(assert) {
    const examinerComment = 'This is an examiner comment !';
    await fillIn(`[data-test-id="finalization-candidate-examiner-comment_${candidateA.id}"]`, examinerComment);

    assert.equal(updateCommentStub.called, true);
  });

  test('it calls the callback when the candidate checkbox is clicked on', async function(assert) {
    await click(`[data-test-id="finalization-candidate-has-seen-end-test-screen_${candidateA.id}"]`);

    assert.equal(toggleCandidateEndTestScreenStub.called, true);
  });

  test('it calls the callback when the collective checkbox is clicked on', async function(assert) {
    await click('.session-finalization-candidates-informations-step__checker');

    assert.equal(toggleAllCandidatesEndTestScreenStub.called, true);
  });

});
