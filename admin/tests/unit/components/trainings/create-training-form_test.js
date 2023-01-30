import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Trainings | CreateTrainingForm', function (hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function () {
    component = createComponent('component:trainings/create-training-form', {
      onSubmit: sinon.stub(),
    });
  });

  module('#updateForm', function () {
    test('it should update appropriate form attribute', function (assert) {
      // given
      const keyToUpdate = 'title';
      const formEvent = { target: { value: 'New Title' } };

      // when
      component.updateForm(keyToUpdate, formEvent);

      // then
      assert.strictEqual(component.form.title, 'New Title');
    });
  });

  module('#onSubmit', function (hooks) {
    let submitEvent;

    hooks.beforeEach(function () {
      // given
      submitEvent = {
        preventDefault: sinon.stub(),
      };
    });

    test('is should call the onSubmit method', async function (assert) {
      // when
      await component.onSubmit(submitEvent);

      // then
      assert.ok(submitEvent.preventDefault.called);
      assert.ok(component.args.onSubmit.called);
    });

    test('it should update EditorLogoUrl form attribute with appropriate base URL', async function (assert) {
      // given
      const baseURL = 'https://images.pix.fr/contenu-formatif/editeur/';
      const formEvent = { target: { value: 'new-logo.svg' } };
      component.updateForm('editorLogoUrl', formEvent);

      // when
      await component.onSubmit(submitEvent);

      // then
      assert.deepEqual(component.args.onSubmit.getCall(0).firstArg.editorLogoUrl, `${baseURL}new-logo.svg`);
    });
  });
});
