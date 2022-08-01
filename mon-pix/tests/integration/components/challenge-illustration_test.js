import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import { find, render, triggerEvent } from '@ember/test-helpers';

module('Integration | Component | challenge-illustration', function (hooks) {
  setupIntlRenderingTest(hooks);

  const IMG_SRC = 'http://www.example.com/this-is-an-example.png';
  const IMG_ALT = "texte alternatif à l'image";
  const HIDDEN_CLASS_NAME = 'challenge-illustration__loaded-image--hidden';

  function findImageElement() {
    return find('.challenge-illustration__loaded-image');
  }

  function findImagePlaceholderElement() {
    return find('.challenge-illustration__placeholder');
  }

  test('renders', async function (assert) {
    // when
    await render(hbs`<ChallengeIllustration/>`);

    // then
    assert.dom(find('div[data-test-id="challenge-illustration"]')).exists();
  });

  test('should display placeholder and hidden image, then only image when it has loaded', async function (assert) {
    // given
    this.set('src', IMG_SRC);
    this.set('alt', IMG_ALT);

    // when
    await render(hbs`<ChallengeIllustration @src={{this.src}} @alt={{this.alt}}/>`);

    // then
    assert.dom(findImageElement()).exists();
    assert.dom(findImageElement().className).hasText(HIDDEN_CLASS_NAME);
    assert.equal(findImageElement().getAttribute('alt'), IMG_ALT);
    assert.equal(findImageElement().getAttribute('src'), IMG_SRC);
    assert.dom(findImagePlaceholderElement()).exists();

    await triggerEvent(findImageElement(), 'load');
    assert.dom(findImageElement()).exists();
    assert.dom(findImageElement().className).hasNoText(HIDDEN_CLASS_NAME);
    assert.dom(findImagePlaceholderElement()).doesNotExist();
  });
});
