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

  module('#updateEditorLogoUrl', function () {
    test('it should update EditorLogoUrl form attribute with appropriate base URL', function (assert) {
      // given
      const baseURL = 'https://images.pix.fr/contenu-formatif/editeur/';
      const formEvent = { target: { value: 'new-logo.svg' } };

      // when
      component.updateEditorLogoUrl(formEvent);

      // then
      assert.strictEqual(component.form.editorLogoUrl, `${baseURL}new-logo.svg`);
    });
  });

  module('#onSubmit', function () {
    test('is should call the onSubmit method', function (assert) {
      // given
      const submitEvent = {
        preventDefault: sinon.stub(),
      };

      // when
      component.onSubmit(submitEvent);

      // then
      assert.ok(submitEvent.preventDefault.called);
      assert.ok(component.args.onSubmit.called);
    });
  });
});
