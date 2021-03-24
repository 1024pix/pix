import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click } from '@ember/test-helpers';
import Object from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session-finalization-examiner-global-comment-step', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders the radio buttons', async function(assert) {
    // given
    const updateExaminerGlobalCommentStub = sinon.stub();
    this.set('examinerGlobalCommentMaxLength', 500);
    this.set('session', Object.create({ examinerGlobalComment: '' }));
    this.set('updateExaminerGlobalComment', updateExaminerGlobalCommentStub);

    // when
    await render(hbs`<SessionFinalizationExaminerGlobalCommentStep @session={{this.session}}
              @updateExaminerGlobalComment={{this.updateExaminerGlobalComment}}
              @examinerGlobalCommentMaxLength={{this.examinerGlobalCommentMaxLength}}  />`);

    // then
    assert.contains('Aucun problème sur la session, en dehors des signalements individuels renseignés lors de l\'étape 1.');
    assert.contains('Je souhaite signaler un ou plusieurs incident(s) ayant impacté la session dans son ensemble');
  });

  test('it should display a text area to declare some incident when the appropriate choice is selected', async function(assert) {
    // given
    const updateExaminerGlobalCommentStub = sinon.stub();
    this.set('examinerGlobalCommentMaxLength', 500);
    this.set('session', Object.create({ examinerGlobalComment: '' }));
    this.set('updateExaminerGlobalComment', updateExaminerGlobalCommentStub);

    // when
    await render(hbs`<SessionFinalizationExaminerGlobalCommentStep @session={{this.session}}
              @updateExaminerGlobalComment={{this.updateExaminerGlobalComment}}
              @examinerGlobalCommentMaxLength={{this.examinerGlobalCommentMaxLength}}  />`);
    await click('[aria-label="Signaler un incident"]');

    // then
    assert.dom('textarea').exists();
  });

  test('it should call the appropriate callback function when typing in the text area when declaring an incident', async function(assert) {
    // given
    const updateExaminerGlobalCommentStub = sinon.stub();
    this.set('examinerGlobalCommentMaxLength', 500);
    this.set('session', Object.create({ examinerGlobalComment: '' }));
    this.set('updateExaminerGlobalComment', updateExaminerGlobalCommentStub);

    // when
    await render(hbs`<SessionFinalizationExaminerGlobalCommentStep @session={{this.session}}
              @updateExaminerGlobalComment={{this.updateExaminerGlobalComment}}
              @examinerGlobalCommentMaxLength={{this.examinerGlobalCommentMaxLength}}  />`);
    await click('[aria-label="Signaler un incident"]');
    await fillIn('#examiner-global-comment', 'You are no more a wizard Harry!');

    // then
    assert.equal(updateExaminerGlobalCommentStub.called, true);
  });
});
