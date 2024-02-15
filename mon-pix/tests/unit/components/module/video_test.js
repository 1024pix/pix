import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createPodsComponent from '../../../helpers/create-pods-component';
import sinon from 'sinon';

module('Unit | Component | Module | Video', function (hooks) {
  setupTest(hooks);

  module('#showModal', function () {
    test('should switch the #modalIsOpen boolean', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const video = store.createRecord('video', { id: 'video-id' });
      const grain = store.createRecord('grain', { id: 'grain-id', elements: [video] });
      store.createRecord('module', { id: 'module-id', grains: [grain] });

      const metrics = this.owner.lookup('service:metrics');
      metrics.add = () => {};

      const component = createPodsComponent('module/video', { video });
      assert.false(component.modalIsOpen);

      // when
      component.showModal();

      // then
      assert.true(component.modalIsOpen);
    });

    test('should call metrics service', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const video = store.createRecord('video', { id: 'video-id' });
      const grain = store.createRecord('grain', { id: 'grain-id', elements: [video] });
      const module = store.createRecord('module', { id: 'module-id', grains: [grain] });

      const metrics = this.owner.lookup('service:metrics');
      metrics.add = sinon.stub();

      const component = createPodsComponent('module/video', { video });
      assert.false(component.modalIsOpen);

      // when
      component.showModal();

      // then
      assert.true(
        metrics.add.calledWithExactly({
          event: 'custom-event',
          'pix-event-category': 'Modulix',
          'pix-event-action': `Passage du module : ${module.id}`,
          'pix-event-name': `Clic sur le bouton transcription : ${video.id}`,
        }),
      );
    });
  });

  module('#closeModal', function () {
    module('When we want to close the modal', function () {
      test('should switch the #modalIsOpen boolean', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const video = store.createRecord('video', { id: 'video-id' });
        const grain = store.createRecord('grain', { id: 'grain-id', elements: [video] });
        store.createRecord('module', { id: 'module-id', grains: [grain] });

        const component = createPodsComponent('module/video', { video });
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
