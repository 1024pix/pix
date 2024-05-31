import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Component | Module | Video', function (hooks) {
  setupTest(hooks);

  module('#hasSubtitles', function () {
    test('should return true if video has a transcription', function (assert) {
      // given
      const video = {
        title: '',
        url: '',
        subtitles: 'hello',
        transcription: '',
      };

      const component = createGlimmerComponent('module/video', { video });

      // when & then
      assert.true(component.hasSubtitles);
    });

    test('should return false if video has an empty transcription', function (assert) {
      // given
      const video = {
        title: '',
        url: '',
        subtitles: '',
        transcription: '',
      };

      const component = createGlimmerComponent('module/video', { video });

      // when & then
      assert.false(component.hasSubtitles);
    });
  });

  module(`#hasTranscription`, function () {
    test(`should return true if video has a transcription`, function (assert) {
      // given
      const video = {
        title: '',
        url: '',
        subtitles: '',
        transcription: 'hello',
      };

      const component = createGlimmerComponent('module/video', { video });

      // when & then
      assert.true(component.hasTranscription);
    });

    test(`should return false if video has an empty transcription`, function (assert) {
      // given
      const video = {
        title: '',
        url: '',
        subtitles: '',
        transcription: '',
      };

      const component = createGlimmerComponent('module/video', { video });

      // when & then
      assert.false(component.hasTranscription);
    });
  });

  module('#showModal', function () {
    test('should switch the #modalIsOpen boolean', function (assert) {
      // given
      const video = { id: 'video-id' };

      const metrics = this.owner.lookup('service:metrics');
      metrics.add = () => {};

      const component = createGlimmerComponent('module/video', { video });
      assert.false(component.modalIsOpen);

      // when
      component.showModal();

      // then
      assert.true(component.modalIsOpen);
    });

    test('should call metrics service', async function (assert) {
      // given
      const video = { id: 'video-id' };
      const moduleId = 'module-id';

      const metrics = this.owner.lookup('service:metrics');
      metrics.add = sinon.stub();

      const component = createGlimmerComponent('module/video', { video, moduleId });
      assert.false(component.modalIsOpen);

      // when
      component.showModal();

      // then
      assert.true(
        metrics.add.calledWithExactly({
          event: 'custom-event',
          'pix-event-category': 'Modulix',
          'pix-event-action': `Passage du module : ${moduleId}`,
          'pix-event-name': `Clic sur le bouton transcription : ${video.id}`,
        }),
      );
    });
  });

  module('#closeModal', function () {
    module('When we want to close the modal', function () {
      test('should switch the #modalIsOpen boolean', async function (assert) {
        // given
        const video = { id: 'video-id' };

        const component = createGlimmerComponent('module/video', { video });
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
