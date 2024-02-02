import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module | Element | Video', function (hooks) {
  setupTest(hooks);

  module(`#hasAlternativeText`, function () {
    test(`should return true if video has an alternativeText`, function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const video = store.createRecord('video', {
        title: '',
        url: '',
        subtitles: '',
        transcription: '',
        alternativeText: 'hello',
      });

      // when & then
      assert.true(video.hasAlternativeText);
    });

    test(`should return false if video has an empty alternativeText`, function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const video = store.createRecord('video', {
        title: '',
        url: '',
        subtitles: '',
        transcription: '',
        alternativeText: '',
      });

      // when & then
      assert.false(video.hasAlternativeText);
    });
  });
});
