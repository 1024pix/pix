import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | modal mobile', function() {

  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{modal-mobile}}`);
    expect(find('.modal-mobile')).to.exist;
  });

  it('should display a title with a "warning" icon', async function() {
    // when
    await render(hbs`{{modal-mobile}}`);

    // then
    expect(find('.modal-title__warning-icon').getAttribute('src')).to.equal('/images/icon-mobile-support-warning.svg');
  });

  it('should display a message', async function() {
    // when
    await render(hbs`{{modal-mobile}}`);

    // then
    const expected = 'Certaines épreuves Pix peuvent être difficiles à réussir sur mobile. Pour une meilleure expérience, nous vous conseillons de passer ce test sur un ordinateur.';
    expect(find('.modal-body').textContent.trim()).to.equal(expected);
  });
});
