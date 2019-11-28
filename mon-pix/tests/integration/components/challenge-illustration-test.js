import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { find, render, triggerEvent } from '@ember/test-helpers';

describe('Integration | Component | challenge-illustration', function() {
  setupRenderingTest();

  const IMG_SRC = 'http://www.example.com/this-is-an-example.png';
  const IMG_ALT = 'texte alternatif à l\'image';
  const HIDDEN_CLASS_NAME = 'challenge-illustration__loaded-image--hidden';

  function findImageElement() {
    return find('.challenge-illustration__loaded-image');
  }

  function findImagePlaceholderElement() {
    return find('.challenge-illustration__placeholder');
  }

  it('renders', async function() {
    // when
    await render(hbs`{{challenge-illustration}}`);

    // then
    expect(find('.challenge-illustration')).to.exist;
  });

  it('should display placeholder and hidden image, then only image when it has loaded', async function() {
    // given
    this.set('src', IMG_SRC);
    this.set('alt', IMG_ALT);

    // when
    await render(hbs`{{challenge-illustration src=src alt=alt}}`);

    // then
    expect(findImageElement()).to.exist;
    expect(findImageElement().className).to.include(HIDDEN_CLASS_NAME);
    expect(findImageElement().getAttribute('alt')).to.equal(IMG_ALT);
    expect(findImageElement().getAttribute('src')).to.equal(IMG_SRC);
    expect(findImagePlaceholderElement()).to.exist;

    await triggerEvent(findImageElement(), 'load');
    expect(findImageElement()).to.exist;
    expect(findImageElement().className).to.not.include(HIDDEN_CLASS_NAME);
    expect(findImagePlaceholderElement()).to.not.exist;
  });
});
