import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { contains } from '../../../helpers/contains';

module('Integration | Component | Content', function (hooks) {
  setupIntlRenderingTest(hooks);

  let model;

  hooks.beforeEach(() => {
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

  test('should display the sitemap menu with expected elements', async function (assert) {
    // when
    await render(hbs`<Sitemap::Content />`);

    // then
    assert.equal(findAll('.sitemap-content-items__link').length, 10);
    assert.dom(contains(this.intl.t('pages.sitemap.title'))).exists();
    assert.dom(contains(this.intl.t('navigation.main.dashboard'))).exists();
    assert.dom(contains(this.intl.t('navigation.main.skills'))).exists();
    assert.dom(contains(this.intl.t('navigation.main.start-certification'))).exists();
    assert.dom(contains(this.intl.t('navigation.main.tutorials'))).exists();
    assert.dom(contains(this.intl.t('navigation.main.code'))).exists();
    assert.dom(contains(this.intl.t('navigation.user.account'))).exists();
    assert.dom(contains(this.intl.t('navigation.user.tests'))).exists();
    assert.dom(contains(this.intl.t('navigation.user.certifications'))).exists();
    assert.dom(contains(this.intl.t('navigation.main.help'))).exists();
    assert.dom(contains(this.intl.t('pages.sitemap.resources'))).exists();
    assert.dom(contains(this.intl.t('pages.sitemap.accessibility.title'))).exists();
    assert.dom(contains(this.intl.t('pages.sitemap.accessibility.help'))).exists();
    assert.dom(contains(this.intl.t('navigation.footer.eula'))).exists();
    assert.dom(contains(this.intl.t('pages.sitemap.cgu.policy'))).exists();
    assert.dom(contains(this.intl.t('pages.sitemap.cgu.subcontractors'))).exists();
  });

  test('should display a sublist within skills containing a link to each skill', async function (assert) {
    // given
    this.set('model', model);

    // when
    await render(hbs`<Sitemap::Content @model={{this.model}}/>`);

    // then
    assert.equal(findAll('.sitemap-content-items-link-skills__skill').length, 2);
  });
});
