import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createPodsComponent from '../../../helpers/create-pods-component';
import sinon from 'sinon';

module('Unit | Component | Module | Image', function (hooks) {
  setupTest(hooks);

  module('#showModal', function () {
    test('should switch the #modalIsOpen boolean', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const image = store.createRecord('image', { id: 'image-id' });

      const metrics = this.owner.lookup('service:metrics');
      metrics.add = () => {};

      const component = createPodsComponent('module/image', { image });
      assert.false(component.modalIsOpen);

      // when
      component.showModal();

      // then
      assert.true(component.modalIsOpen);
    });

    test('should call metrics service', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const image = store.createRecord('image', { id: 'image-id' });

      const metrics = this.owner.lookup('service:metrics');
      metrics.add = sinon.stub();

      const component = createPodsComponent('module/image', { image });
      assert.false(component.modalIsOpen);

      // when
      component.showModal();

      // then
      assert.true(
        metrics.add.calledWithExactly({
          event: 'custom-event',
          'pix-event-category': 'Modulix',
          'pix-event-action': `Afficher l’alternative textuelle : ${image.id}`,
          'pix-event-name': `Click sur le bouton alternative textuelle : ${image.id}`,
        }),
      );
    });
  });

  module('#closeModal', function () {
    module('When we want to close the modal', function () {
      test('should switch the #modalIsOpen boolean', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const image = store.createRecord('image', { id: 'image-id' });

        const component = createPodsComponent('module/image', { image });
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
