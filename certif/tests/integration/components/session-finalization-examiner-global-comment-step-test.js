import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, find } from '@ember/test-helpers';
import Object from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session-finalization-examiner-global-comment-step', function(hooks) {
  setupRenderingTest(hooks);

  let firstComment;
  const updateExaminerGlobalCommentStub = sinon.stub().returns();

  hooks.beforeEach(async function() {
    firstComment = 'You are a wizard Harry !';
    this.set('examinerGlobalCommentMaxLength', 500);
    this.set('session', Object.create({ examinerGlobalComment: '' }));
    this.set('updateExaminerGlobalComment', updateExaminerGlobalCommentStub);

    await render(hbs`<SessionFinalizationExaminerGlobalCommentStep @session={{this.session}} 
              @updateExaminerGlobalComment={{this.updateExaminerGlobalComment}}
              @examinerGlobalCommentMaxLength={{this.examinerGlobalCommentMaxLength}}  />`);
    await fillIn('#examiner-global-comment', firstComment);
  });

  test('it renders', async function(assert) {
    assert.dom('label').hasText(
      'Vous pouvez indiquer un commentaire global sur cette session, par exemple si vous avez rencontré un problème technique qui a impacté le déroulement de la session.'
    );
    assert.dom('div.session-finalization-examiner-global-comment-step__characters-information')
      .hasText(this.session.examinerGlobalComment.length + ' / ' + this.examinerGlobalCommentMaxLength);
    assert.equal(
      find('textarea').value.trim(),
      firstComment
    );
  });

  module('when changing textarea content', function() {
    test('it calls the appropriate callback function', async function(assert) {
      await fillIn('#examiner-global-comment', 'You are no more a wizard Harry!');
      assert.equal(updateExaminerGlobalCommentStub.called, true);
    });
  });

});
