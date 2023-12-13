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

  test('it does not close the edition panel when comments cannot be saved', async function (assert) {
    // given
    component.editingComments = true;
    component.args = {
      onCommentsSave: sinon.stub(),
    };

    // when
    await component.saveComments();

    // then
    assert.true(component.editingComments);
  });

  test('it closes the edition panel when comments are saved', async function (assert) {
    // given
    component.editingComments = true;
    component.args = {
      onCommentsSave: sinon.stub(),
    };

    component.args.onCommentsSave.resolves(true);

    // when
    await component.saveComments();

    // then
    assert.false(component.editingComments);
  });
});
