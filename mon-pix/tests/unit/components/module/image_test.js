import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createPodsComponent from '../../../helpers/create-pods-component';

module('Unit | Component | Module | Image', function (hooks) {
  setupTest(hooks);

  module('#closeModal', function () {
    module('When we want to close the modal', function () {
      test('should switch the #modalIsOpen boolean', async function (assert) {
        // given
        const component = createPodsComponent('module/image');
        assert.false(component.modalIsOpen);

        component.showModal();

        // when
        assert.true(component.modalIsOpen);
        component.closeModal();

        // then
        assert.false(component.modalIsOpen);
      });
    });
  });
});
