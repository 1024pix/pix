import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | banner-brand', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{banner-brand}}`);
    expect(find('.banner-brand')).to.exist;
  });

  context('When banner has a title', function() {

    beforeEach(async function() {
      this.set('bannerTitle', 'My banner');
      await render(hbs`{{banner-brand title=bannerTitle}}`);
    });

    it('should render the banner with a title', function() {
      expect(find('.banner-brand__title')).to.exist;
      expect(find('.banner-brand__title h1').textContent).to.equal('My banner');
    });

    it('should render the banner with a splitter', function() {
      expect(find('.banner-brand__splitter')).to.exist;
    });

  });

  context('When banner doesn\'t have a title', function() {
    beforeEach(async function() {
      this.set('bannerTitle', null);
      await render(hbs`{{banner-brand title=bannerTitle}}`);
    });

    it('should not render the banner with a title', function() {
      expect(find('.banner-brand__title')).to.not.exist;
    });

    it('should not render the banner with a splitter', function() {
      expect(find('.banner-brand__splitter')).to.not.exist;
    });

  });

});

