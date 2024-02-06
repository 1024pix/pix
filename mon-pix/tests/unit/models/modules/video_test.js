import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module | Element | Video', function (hooks) {
  setupTest(hooks);

  module(`#hasTranscription`, function () {
    test(`should return true if video has a transcription`, function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const video = store.createRecord('video', {
        title: '',
        url: '',
        subtitles: '',
        transcription: 'hello',
      });

      // when & then
      assert.true(video.hasTranscription);
    });

    test(`should return false if video has an empty transcription`, function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const video = store.createRecord('video', {
        title: '',
        url: '',
        subtitles: '',
        transcription: '',
      });

      // when & then
      assert.false(video.hasTranscription);
    });
  });
});
