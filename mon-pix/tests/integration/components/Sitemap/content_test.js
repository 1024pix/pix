import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | Sitemap::Content', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the sitemap menu with expected elements', async function (assert) {
    // given & when
    const screen = await render(hbs`<Sitemap::Content />`);

    // then
    assert.dom(screen.getByRole('heading', { name: this.intl.t('pages.sitemap.title') })).exists();
    assert.dom(screen.getByText(this.intl.t('pages.sitemap.resources'))).exists();
    assert
      .dom(screen.getByRole('link', { name: this.intl.t('navigation.main.dashboard') }))
      .hasAttribute('href', '/accueil');
    assert
      .dom(screen.getByRole('link', { name: this.intl.t('navigation.main.skills') }))
      .hasAttribute('href', '/competences');
    assert
      .dom(screen.getByRole('link', { name: this.intl.t('navigation.main.start-certification') }))
      .hasAttribute('href', '/certifications');
    assert
      .dom(screen.getByRole('link', { name: this.intl.t('navigation.main.tutorials') }))
      .hasAttribute('href', '/mes-tutos');
    assert
      .dom(screen.getByRole('link', { name: this.intl.t('navigation.main.code') }))
      .hasAttribute('href', '/campagnes');
    assert
      .dom(screen.getByRole('link', { name: this.intl.t('navigation.user.account') }))
      .hasAttribute('href', '/mon-compte');
    assert
      .dom(screen.getByRole('link', { name: this.intl.t('navigation.user.tests') }))
      .hasAttribute('href', '/mes-parcours');
    assert
      .dom(screen.getByRole('link', { name: this.intl.t('navigation.user.certifications') }))
      .hasAttribute('href', '/mes-certifications');
    assert
      .dom(screen.getByRole('link', { name: this.intl.t('navigation.main.trainings') }))
      .hasAttribute('href', '/mes-formations');
  });

  test('should display a sublist within skills containing a link to each skill', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const scorecard1 = store.createRecord('scorecard', { id: 1, name: 'Name 1' });
    const scorecard2 = store.createRecord('scorecard', { id: 2, name: 'Name 2' });
    const model = {
      scorecards: [scorecard1, scorecard2],
    };
    this.set('model', model);

    // when
    const screen = await render(hbs`<Sitemap::Content @model={{this.model}}/>`);

    // then
    assert.dom(screen.getByRole('link', { name: 'Name 1' })).exists();
    assert.dom(screen.getByRole('link', { name: 'Name 2' })).exists();
  });

  test('should contain an external link to the list of recipient processors of Pix users ’personal data', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    const screen = await render(hbs`<Sitemap::Content />`);

    // then
    assert
      .dom(
        screen.getByRole('link', {
          name: `${this.intl.t('pages.sitemap.cgu.subcontractors')} ${this.intl.t('navigation.external-link-title')}`,
        })
      )
      .hasAttribute('href', 'https://pix.fr/politique-protection-donnees-personnelles-app');
  });

  test('should contain an external link to help accessibility page', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    const screen = await render(hbs`<Sitemap::Content />`);

    // then
    assert
      .dom(
        screen.getByRole('link', {
          name: `${this.intl.t('pages.sitemap.accessibility.help')} ${this.intl.t('navigation.external-link-title')}`,
        })
      )
      .hasAttribute('href', 'https://pix.fr/aide-accessibilite');
  });

  test('should contain an external link to pix support home page', async function (assert) {
    // given & when
    const screen = await render(hbs`<Sitemap::Content />`);

    // then
    assert
      .dom(
        screen.getByRole('link', {
          name: `${this.intl.t('navigation.main.help')} ${this.intl.t('navigation.external-link-title')}`,
        })
      )
      .hasAttribute('href', 'https://support.pix.org/fr/support/home');
  });

  test('should contain an external link to accessibility page', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    const screen = await render(hbs`<Sitemap::Content />`);

    // then
    assert
      .dom(
        screen.getByRole('link', {
          name: `${this.intl.t('pages.sitemap.accessibility.title')} ${this.intl.t('navigation.external-link-title')}`,
        })
      )
      .hasAttribute('href', 'https://pix.fr/accessibilite');
  });

  test('should contain an external link to cgu page', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    const screen = await render(hbs`<Sitemap::Content />`);

    // then
    assert
      .dom(
        screen.getByRole('link', {
          name: `${this.intl.t('navigation.footer.eula')} ${this.intl.t('navigation.external-link-title')}`,
        })
      )
      .hasAttribute('href', 'https://pix.fr/conditions-generales-d-utilisation');
  });

  test('should contain an external link to data protection policy page', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    const screen = await render(hbs`<Sitemap::Content />`);

    // then
    assert
      .dom(
        screen.getByRole('link', {
          name: `${this.intl.t('pages.sitemap.cgu.policy')} ${this.intl.t('navigation.external-link-title')}`,
        })
      )
      .hasAttribute('href', 'https://pix.fr/politique-protection-donnees-personnelles-app');
  });
});
