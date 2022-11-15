import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { contains } from '../../../helpers/contains';

module('Integration | Component | Content', function (hooks) {
  setupIntlRenderingTest(hooks);

  let model;

  hooks.beforeEach(function () {
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
    assert.dom('.sitemap-content-items__link').exists({ count: 11 });
    assert.ok(contains(this.intl.t('pages.sitemap.title')));
    assert.ok(contains(this.intl.t('navigation.main.dashboard')));
    assert.ok(contains(this.intl.t('navigation.main.skills')));
    assert.ok(contains(this.intl.t('navigation.main.start-certification')));
    assert.ok(contains(this.intl.t('navigation.main.tutorials')));
    assert.ok(contains(this.intl.t('navigation.main.code')));
    assert.ok(contains(this.intl.t('navigation.user.account')));
    assert.ok(contains(this.intl.t('navigation.user.tests')));
    assert.ok(contains(this.intl.t('navigation.user.certifications')));
    assert.ok(contains(this.intl.t('navigation.main.help')));
    assert.ok(contains(this.intl.t('pages.sitemap.resources')));
    assert.ok(contains(this.intl.t('pages.sitemap.accessibility.title')));
    assert.ok(contains(this.intl.t('pages.sitemap.accessibility.help')));
    assert.ok(contains(this.intl.t('navigation.footer.eula')));
    assert.ok(contains(this.intl.t('pages.sitemap.cgu.policy')));
    assert.ok(contains(this.intl.t('pages.sitemap.cgu.subcontractors')));
  });

  test('should display a sublist within skills containing a link to each skill', async function (assert) {
    // given
    this.set('model', model);

    // when
    await render(hbs`<Sitemap::Content @model={{this.model}}/>`);

    // then
    assert.dom('.sitemap-content-items-link-skills__skill').exists({ count: 2 });
  });
});
