import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | assessment-banner', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{assessment-banner}}`);
    expect(find('.assessment-banner')).to.exist;
  });

  it('should not display home link button if not requested', async function() {
    this.set('assessmentTitle', 'My assessment');
    await render(hbs`{{assessment-banner title=assessmentTitle}}`);
    expect(find('.assessment-banner__home-link')).to.not.exist;
  });

  it('should display home link button if requested', async function() {
    this.set('assessmentTitle', 'My assessment');
    await render(hbs`{{assessment-banner title=assessmentTitle displayHomeLink=true}}`);
    expect(find('.assessment-banner__home-link')).to.exist;
  });

  context('When assessment has a title', function() {

    beforeEach(async function() {
      this.set('assessmentTitle', 'My assessment');
      await render(hbs`{{assessment-banner title=assessmentTitle}}`);
    });

    it('should render the banner with a title', function() {
      expect(find('.assessment-banner__title')).to.exist;
      expect(find('.assessment-banner__title').textContent).to.equal('My assessment');
    });

    it('should render the banner with a splitter', function() {
      expect(find('.assessment-banner__splitter')).to.exist;
    });
  });

  context('When assessment doesn\'t have a title', function() {
    beforeEach(async function() {
      this.set('assessmentTitle', null);
      await render(hbs`{{assessment-banner title=assessmentTitle}}`);
    });

    it('should not render the banner with a title', function() {
      expect(find('.assessment-banner__title')).to.not.exist;
    });

    it('should not render the banner with a splitter', function() {
      expect(find('.assessment-banner__splitter')).to.not.exist;
    });
  });
});
