import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Component | Module | Image', function (hooks) {
  setupTest(hooks);

  module(`#hasAlternativeText`, function () {
    test(`should return true if image has an alternativeText`, function (assert) {
      // given
      const image = { url: '', alt: '', alternativeText: 'hello' };

      const component = createGlimmerComponent('module/element/image', { image });

      // when & then
      assert.true(component.hasAlternativeText);
    });

    test(`should return false if image has an empty alternativeText`, function (assert) {
      // given
      const image = { url: '', alt: '', alternativeText: '' };

      const component = createGlimmerComponent('module/element/image', { image });

      // when & then
      assert.false(component.hasAlternativeText);
    });
  });

  module('#showModal', function () {
    test('should switch the #modalIsOpen boolean', function (assert) {
      // given
      const image = { id: 'image-id' };

      const component = createGlimmerComponent('module/element/image', { image });
      assert.false(component.modalIsOpen);

      // when
      component.showModal();

      // then
      assert.true(component.modalIsOpen);
    });

    test('should call metrics service', async function (assert) {
      // given
      const image = { id: 'image-id' };
      const moduleId = 'module-id';

      const metrics = this.owner.lookup('service:metrics');
      metrics.add = sinon.stub();

      const component = createGlimmerComponent('module/element/image', { image, moduleId });
      assert.false(component.modalIsOpen);

      // when
      component.showModal();

      // then
      assert.true(
        metrics.add.calledWithExactly({
          event: 'custom-event',
          'pix-event-category': 'Modulix',
          'pix-event-action': `Passage du module : ${moduleId}`,
          'pix-event-name': `Click sur le bouton alternative textuelle : ${image.id}`,
        }),
      );
    });
  });

  module('#closeModal', function () {
    module('When we want to close the modal', function () {
      test('should switch the #modalIsOpen boolean', async function (assert) {
        // given
        const image = { id: 'image-id' };

        const component = createGlimmerComponent('module/element/image', { image });
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
