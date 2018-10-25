import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe.only('Integration | Component | campaign-banner', function() {
  setupComponentTest('campaign-banner', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{campaign-banner}}`);
    expect(this.$()).to.have.length(1);
  });

  context('When campaign has a title', function() {

    beforeEach(function() {
      this.set('campaignTitle', 'My campaign');
      this.render(hbs`{{campaign-banner title=campaignTitle}}`);
    });

    it('should render the banner with a title', function() {
      expect(this.$('.campaign-banner__title')).to.have.length(1);
      expect(this.$('.campaign-banner__title').text()).to.equal('My campaign');
    });

    it('should render the banner with a splitter', function() {
      expect(this.$('.campaign-banner__splitter')).to.have.length(1);
    });

  });

  context('When campaign doesn\'t have a title', function() {
    beforeEach(function() {
      this.set('campaignTitle', null);
      this.render(hbs`{{campaign-banner title=campaignTitle}}`);
    });

    it('should not render the banner with a title', function() {
      expect(this.$('.campaign-banner__title')).to.have.length(0);
    });

    it('should not render the banner with a splitter', function() {
      expect(this.$('.campaign-banner__splitter')).to.have.length(0);
    });

  });

});
