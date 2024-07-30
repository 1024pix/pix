import { render } from '@1024pix/ember-testing-library';
import { click, findAll } from '@ember/test-helpers';
import ModulixVideoElement from 'mon-pix/components/module/element/video';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Video', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a video', async function (assert) {
    // given
    const url = 'https://videos.pix.fr/modulix/placeholder-video.mp4';

    const videoElement = {
      url,
      title: 'title',
      subtitles: 'subtitles',
      transcription: '',
    };

    //  when
    const screen = await render(<template><ModulixVideoElement @video={{videoElement}} /></template>);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-video').length, 1);
    assert.ok(document.getElementsByClassName('pix-video-player'));
  });

  test('should be able to use the subtitles track when provided', async function (assert) {
    // given
    const url = 'https://videos.pix.fr/modulix/placeholder-video.mp4';

    const videoElement = {
      url,
      title: 'title',
      subtitles: 'https://videos.pix.fr/modulix/placeholder-video.vtt',
      transcription: 'transcription',
    };

    //  when
    await render(<template><ModulixVideoElement @video={{videoElement}} /></template>);

    // then
    assert.dom('video > track').exists();
  });

  test('should not be able to use the subtitles track when there is none', async function (assert) {
    // given
    const url = 'https://videos.pix.fr/modulix/placeholder-video.mp4';

    const videoElement = {
      url,
      title: 'title',
      subtitles: '',
      transcription: 'transcription',
    };

    //  when
    await render(<template><ModulixVideoElement @video={{videoElement}} /></template>);

    // then
    assert.dom('video > track').doesNotExist();
  });

  test('should be able to use the modal for transcription', async function (assert) {
    // given
    const url = 'https://videos.pix.fr/modulix/placeholder-video.mp4';

    const videoElement = {
      url,
      title: 'title',
      subtitles: 'subtitles',
      transcription: 'transcription',
    };
    const openTranscriptionStub = sinon.stub();

    //  when
    const screen = await render(
      <template><ModulixVideoElement @video={{videoElement}} @openTranscription={{openTranscriptionStub}} /></template>,
    );

    // then
    await click(screen.getByRole('button', { name: 'Afficher la transcription' }));
    assert.ok(await screen.findByRole('dialog'));
    assert.ok(screen.getByText('transcription'));
    assert.ok(openTranscriptionStub.calledOnce);
  });

  test('should not be able to open the modal if there is no transcription', async function (assert) {
    // given
    const url = 'https://videos.pix.fr/modulix/placeholder-video.mp4';

    const videoElement = {
      url,
      title: 'title',
      subtitles: 'subtitles',
      transcription: '',
    };

    //  when
    const screen = await render(<template><ModulixVideoElement @video={{videoElement}} /></template>);

    // then
    const transcriptionButton = await screen.queryByRole('button', { name: 'Afficher la transcription' });
    assert.dom(transcriptionButton).doesNotExist();
  });

  module('when video has a poster', function () {
    test('video element has a data-poster attribute', async function (assert) {
      // given
      const url = 'https://videos.pix.fr/modulix/placeholder-video.mp4';

      const videoElement = {
        url,
        title: 'title',
        subtitles: 'subtitles',
        transcription: '',
        poster: 'https://example.org/modulix/video-poster.jpg',
      };

      //  when
      await render(<template><ModulixVideoElement @video={{videoElement}} /></template>);

      // then
      assert.dom('video').hasAttribute('data-poster', 'https://example.org/modulix/video-poster.jpg');
    });
  });
});
