import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, find } from '@ember/test-helpers';
import Object from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session-finalization-examiner-comment-step', function(hooks) {
  setupRenderingTest(hooks);

  let firstComment;

  hooks.beforeEach(async function() {
    firstComment = 'You are a wizard Harry !';
    this.set('textareaMaxLength', 500);
    this.set('session', Object.create({ examinerComment: '' }));

    await render(hbs`<SessionFinalizationExaminerCommentStep @session={{this.session}}  />`);
    await fillIn('#examiner-comment', firstComment);
  });

  test('it renders', async function(assert) {
    assert.equal(
      find('label').textContent.trim(),
      'Vous pouvez indiquer un commentaire global sur cette session, par exemple si vous avez rencontré un problème technique qui a impacté le déroulement de la session.'
    );
    assert.equal(
      find('div.session-finalization-examiner-comment-step__characters-information').textContent.trim(),
      this.session.examinerComment.length + ' / ' + this.textareaMaxLength
    );
    assert.equal(
      find('textarea').value.trim(),
      firstComment
    );
  });

  module('when changing textarea content', function() {
    test('it changes the textarea content and characters indicator', async function(assert) {
      await fillIn('#examiner-comment', 'You are no more a wizard Harry!');
      assert.equal(
        find('div.session-finalization-examiner-comment-step__characters-information').textContent.trim(),
        this.session.examinerComment.length + ' / ' + this.textareaMaxLength
      );
      assert.equal(find('#examiner-comment').value.trim(),
        'You are no more a wizard Harry!'
      );
    });
  });

});
