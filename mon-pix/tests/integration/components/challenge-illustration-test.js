import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { find, render, triggerEvent } from '@ember/test-helpers';

describe('Integration | Component | challenge-illustration', function() {
  setupRenderingTest();

  const IMG_SRC = 'http://www.example.com/this-is-an-example.png';
  const IMG_ALT = 'texte alternatif à l\'image';

  const IMAGE = '.challenge-illustration__loaded-image';
  const IMAGE_PLACEHOLDER = '.challenge-illustration__placeholder';

  const HIDDEN_CLASS_NAME = 'challenge-illustration__loaded-image--hidden';

  it('renders', async function() {
    // when
    await render(hbs`{{challenge-illustration}}`);

    // then
    expect(find('.challenge-illustration')).to.exist;
  });

  describe('When there is an image', function() {

    it('should display placeholder and hidden image, then only image when it has loaded', async function() {
      // given
      this.set('src', IMG_SRC);
      this.set('alt', IMG_ALT);

      // when
      await render(hbs`{{challenge-illustration src=src alt=alt}}`);

      // then
      expect(find(IMAGE)).to.exist;
      expect(find(IMAGE).className).to.include(HIDDEN_CLASS_NAME);
      expect(find(IMAGE).getAttribute('alt')).to.equal(IMG_ALT);
      expect(find(IMAGE).getAttribute('src')).to.equal(IMG_SRC);
      expect(find(IMAGE_PLACEHOLDER)).to.exist;

      await triggerEvent(IMAGE, 'load');
      expect(find(IMAGE)).to.exist;
      expect(find(IMAGE).className).to.not.include(HIDDEN_CLASS_NAME);
      expect(find(IMAGE_PLACEHOLDER)).to.not.exist;
    });
  });

  describe('When there is no image', function() {

    it('should display nothing', async function() {
      // given
      this.set('src', '');
      this.set('alt', '');

      // when
      await render(hbs`{{challenge-illustration src=src alt=alt}}`);

      // then
      expect(find(IMAGE)).to.exist;
      expect(find(IMAGE).className).to.include(HIDDEN_CLASS_NAME);
      expect(find(IMAGE_PLACEHOLDER)).to.not.exist;
    });
  });
});
