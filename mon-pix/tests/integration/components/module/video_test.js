import { render } from '@1024pix/ember-testing-library';
import { click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

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

    this.set('video', videoElement);

    //  when
    const screen = await render(hbs`<Module::Element::Video @video={{this.video}}/>`);

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

    this.set('video', videoElement);

    //  when
    await render(hbs`<Module::Element::Video @video={{this.video}}/>`);

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

    this.set('video', videoElement);

    //  when
    await render(hbs`<Module::Element::Video @video={{this.video}}/>`);

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

    this.set('video', videoElement);

    //  when
    const screen = await render(hbs`<Module::Element::Video @video={{this.video}}/>`);

    // then
    await click(screen.getByRole('button', { name: 'Afficher la transcription' }));
    assert.ok(await screen.findByRole('dialog'));
    assert.ok(screen.getByText('transcription'));
  });

  test('should not be able to open the modal if there is no transcription', async function (assert) {
    // given
    const url = 'https://videos.pix.fr/modulix/placeholder-video.mp4';

    const video = {
      url,
      title: 'title',
      subtitles: 'subtitles',
      transcription: '',
    };

    this.set('video', video);

    //  when
    const screen = await render(hbs`<Module::Element::Video @video={{this.video}}/>`);

    // then
    const transcriptionButton = await screen.queryByRole('button', { name: 'Afficher la transcription' });
    assert.dom(transcriptionButton).doesNotExist();
  });
});
