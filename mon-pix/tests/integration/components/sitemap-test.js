import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { contains } from '../../helpers/contains';

describe('Integration | Component | Sitemap', function() {

  setupIntlRenderingTest();

  let model;

  beforeEach(() => {
    model = {
      scorecards: [
        {
          id: 1,
          name: 'Name',
        },
        {
          id: 2,
          name: 'Name 2',
        },
      ],
    };
  });

  it('should display the sitemap menu with expected elements', async function() {
    // when
    await render(hbs`<Sitemap />`);

    // then
    expect(findAll('.sitemap-items__link')).to.have.lengthOf(10);
    expect(contains(this.intl.t('pages.sitemap.title'))).to.exist;
    expect(contains(this.intl.t('navigation.main.dashboard'))).to.exist;
    expect(contains(this.intl.t('navigation.main.skills'))).to.exist;
    expect(contains(this.intl.t('navigation.main.start-certification'))).to.exist;
    expect(contains(this.intl.t('navigation.main.tutorials'))).to.exist;
    expect(contains(this.intl.t('navigation.main.code'))).to.exist;
    expect(contains(this.intl.t('navigation.user.account'))).to.exist;
    expect(contains(this.intl.t('navigation.user.tests'))).to.exist;
    expect(contains(this.intl.t('navigation.user.certifications'))).to.exist;
    expect(contains(this.intl.t('navigation.main.help'))).to.exist;
    expect(contains(this.intl.t('pages.sitemap.resources'))).to.exist;
    expect(contains(this.intl.t('pages.sitemap.accessibility.title'))).to.exist;
    expect(contains(this.intl.t('pages.sitemap.accessibility.help'))).to.exist;
    expect(contains(this.intl.t('navigation.footer.eula'))).to.exist;
    expect(contains(this.intl.t('pages.sitemap.cgu.policy'))).to.exist;
    expect(contains(this.intl.t('pages.sitemap.cgu.subcontractors'))).to.exist;
  });

  it('should display a sublist within skills containing a link to each skill', async function() {
    // given
    this.set('model', model);

    // when
    await render(hbs`<Sitemap @model={{this.model}}/>`);

    // then
    expect(findAll('.sitemap-items-link-skills__skill')).to.have.lengthOf(2);
  });
});
