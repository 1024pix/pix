import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | campaign-banner', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{campaign-banner}}`);
    expect(find('.campaign-banner')).to.exist;
  });

  context('When campaign has a title', function() {

    beforeEach(async function() {
      this.set('campaignTitle', 'My campaign');
      await render(hbs`{{campaign-banner title=campaignTitle}}`);
    });

    it('should render the banner with a title', function() {
      expect(find('.campaign-banner__title')).to.exist;
      expect(find('.campaign-banner__title').textContent).to.equal('My campaign');
    });

    it('should render the banner with a splitter', function() {
      expect(find('.campaign-banner__splitter')).to.exist;
    });

  });

  context('When campaign doesn\'t have a title', function() {
    beforeEach(async function() {
      this.set('campaignTitle', null);
      await render(hbs`{{campaign-banner title=campaignTitle}}`);
    });

    it('should not render the banner with a title', function() {
      expect(find('.campaign-banner__title')).to.not.exist;
    });

    it('should not render the banner with a splitter', function() {
      expect(find('.campaign-banner__splitter')).to.not.exist;
    });

  });

});
