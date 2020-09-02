import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | assessment-banner', function() {
  setupIntlRenderingTest();

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

    it('should render the banner with accessible title information', function() {
      const title = find('.assessment-banner__title');
      expect(title).to.exist;
      expect(title.childNodes).to.have.length(2);
      const a11yText = title.firstChild.textContent;
      expect(a11yText).to.equal('Épreuve pour l\'évaluation : ');
    });

    it('should render the banner with a title', function() {
      const title = find('.assessment-banner__title');
      expect(title).to.exist;
      expect(title.childNodes).to.have.length(2);
      const assessmentName = title.lastChild.textContent;
      expect(assessmentName).to.equal('My assessment');
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
