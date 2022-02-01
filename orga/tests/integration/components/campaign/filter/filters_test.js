import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | Campaign::Filter::Filters', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('triggerFilteringSpy', () => {});
    this.set('onClickStatusFilterSpy', () => {});
  });

  test('it should display filters', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::Filter::Filters
        @onFilter={{this.triggerFilteringSpy}}
        @onClickStatusFilter={{this.onClickStatusFilterSpy}}
        @numResults={{1}} />`
    );

    // then
    assert.contains('Filtres');
    assert.dom(screen.getByLabelText('Rechercher une campagne')).exists();
    assert.dom(screen.getByLabelText('Rechercher un créateur')).exists();
    assert.dom(screen.getByLabelText('Archivées')).exists();
    assert.dom(screen.getByLabelText('Actives')).exists();
    assert.contains('1 campagne');
  });

  module('when showing current user campaign list', function () {
    test('it should not show creator input', async function (assert) {
      // given / when
      const screen = await renderScreen(
        hbs`<Campaign::Filter::Filters
        @onFilter={{this.triggerFilteringSpy}}
        @onClickStatusFilter={{this.onClickStatusFilterSpy}}
        @numResults={{1}}
        @listOnlyCampaignsOfCurrentUser={{true}} />`
      );

      // then
      assert.dom(screen.queryByLabelText('Rechercher un créateur')).doesNotExist();
    });
  });

  test('[A11Y] it should make filters container accessible', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::Filter::Filters
        @onFilter={{this.triggerFilteringSpy}}
        @onClickStatusFilter={{this.onClickStatusFilterSpy}}
        @numResults={{1}} />`
    );

    // then
    assert.dom(screen.getByText(this.intl.t('pages.campaigns-list.filter.legend'))).exists();
  });
});
