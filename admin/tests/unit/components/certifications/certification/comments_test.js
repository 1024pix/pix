import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';
import sinon from 'sinon';

module('Unit | Component | certifications/certification/comments', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:certifications/certification/comments');
  });

  test('it does not close the edition panel when comment cannot be saved', async function (assert) {
    // given
    component.isEditingJuryComment = true;
    component.args = {
      onJuryCommentSave: sinon.stub(),
    };

    // when
    await component.saveJuryComment();

    // then
    assert.true(component.isEditingJuryComment);
  });

  test('it closes the edition panel when comment is saved', async function (assert) {
    // given
    component.isEditingJuryComment = true;
    component.args = {
      onJuryCommentSave: sinon.stub(),
    };

    component.args.onJuryCommentSave.resolves(true);

    // when
    await component.saveJuryComment();

    // then
    assert.false(component.isEditingJuryComment);
  });
});
