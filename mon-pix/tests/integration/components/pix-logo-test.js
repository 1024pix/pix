import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | pix logo', function() {

  setupIntlRenderingTest();

  beforeEach(async function() {
    await render(hbs`{{pix-logo}}`);
  });

  it('renders', function() {
    expect(find('.pix-logo')).to.exist;
  });

  it('should display the logo', function() {
    expect(find('.pix-logo__image').getAttribute('src')).to.equal('/images/pix-logo.svg');
  });

  it('should have a textual alternative', function() {
    expect(find('.pix-logo__image').getAttribute('alt')).to.equal('pix');
  });

  it('should have a title in the link', function() {
    expect(find('.pix-logo__link').getAttribute('title')).to.equal('Page d\'accueil');
  });

});
