import { render } from '@1024pix/ember-testing-library';
import { triggerEvent } from '@ember/test-helpers';
import ChallengeIllustration from 'mon-pix/components/challenge-illustration';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | challenge-illustration', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display placeholder and hidden image, then only image when it has loaded', async function (assert) {
    // given
    const imageSource = 'http://www.example.com/this-is-an-example.png';
    const imageAlternativeText = "texte alternatif à l'image";

    const src = imageSource;
    const alt = imageAlternativeText;

    // when
    const screen = await render(<template><ChallengeIllustration @src={{src}} @alt={{alt}} /></template>);

    // then
    const hiddenImage = await screen.getByAltText(imageAlternativeText);
    assert.dom(hiddenImage).exists();
    assert.dom(screen.getByLabelText("Chargement de l'image en cours")).exists();

    await triggerEvent(hiddenImage, 'load');

    const visibleImage = screen.getByRole('img', { name: imageAlternativeText });
    assert.dom(visibleImage).hasAttribute('src', imageSource);
    assert.dom(screen.queryByLabelText("Chargement de l'image en cours")).doesNotExist();
  });

  test('should set an empty alt when illustrationAlt is null', async function (assert) {
    // given
    const imageSource = 'http://www.example.com/this-is-an-example.png';
    const imageAlternativeText = null;

    const src = imageSource;
    const alt = imageAlternativeText;

    // when
    const screen = await render(<template><ChallengeIllustration @src={{src}} @alt={{alt}} /></template>);

    // then
    const hiddenImage = await screen.getByAltText('');
    assert.dom(hiddenImage).exists();
  });
});
