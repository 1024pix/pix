import { render } from '@1024pix/ember-testing-library';
import { triggerEvent } from '@ember/test-helpers';
import ChallengeMedia from 'junior/components/challenge/challenge-media';
import { setupRenderingTest } from 'junior/helpers/tests';
import { module, test } from 'qunit';

module('Integration | Component | ChallengeMedia', function (hooks) {
  setupRenderingTest(hooks);

  module('When the media is an image', function () {
    test('displays an image', async function (assert) {
      const screen = await render(
        <template><ChallengeMedia @src="https://fake-image.svg" @type="image" @alt="texte alternatif" /></template>,
      );

      const hiddenImage = await screen.getByAltText('texte alternatif');
      await triggerEvent(hiddenImage, 'load');

      assert.strictEqual(screen.getByRole('img').getAttribute('src'), 'https://fake-image.svg');
    });

    test('displays a loading message when the image is not loaded yet', async function (assert) {
      const screen = await render(
        <template><ChallengeMedia @src="https://fake-image.svg" @type="image" @alt="texte alternatif" /></template>,
      );

      const hiddenImage = await screen.getByAltText('texte alternatif');
      assert.dom(hiddenImage).exists();
      assert.dom(screen.getByLabelText('Chargement en cours')).exists();
    });
  });

  module('When the media is a video', function () {
    test('displays the video', async function (assert) {
      await render(<template><ChallengeMedia @src="https://fake-video.mp4" @type="video" /></template>);
      const video = document.getElementsByTagName('video')[0];
      await triggerEvent(video, 'loadeddata');

      assert.strictEqual(video.getAttribute('src'), 'https://fake-video.mp4');
    });

    test('displays a loading message when the video is not loaded yet', async function (assert) {
      const screen = await render(<template><ChallengeMedia @src="www.fake-url.mp4" @type="video" /></template>);

      const video = document.getElementsByTagName('video')[0];
      assert.dom(video).exists();
      assert.dom(screen.getByLabelText('Chargement en cours')).exists();
    });
  });
});
