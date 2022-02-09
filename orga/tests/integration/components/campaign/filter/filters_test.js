import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | Campaign::Filter::Filters', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('triggerFilteringSpy', () => {});
    this.set('onClickStatusFilterSpy', () => {});
    this.set('onClickClearFiltersSpy', () => {});
  });

  test('it should display filters', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::Filter::Filters
        @onFilter={{this.triggerFilteringSpy}}
        @onClickStatusFilter={{this.onClickStatusFilterSpy}}
        @onClearFilters={{this.onClickClearFiltersSpy}}
        @numResults={{1}} />`
    );

    // then
    assert.dom(screen.getByText('Filtres')).exists();
    assert.dom(screen.getByLabelText('Rechercher une campagne')).exists();
    assert.dom(screen.getByLabelText('Rechercher un propriétaire')).exists();
    assert.dom(screen.getByLabelText('Archivées')).exists();
    assert.dom(screen.getByLabelText('Actives')).exists();
    assert.dom(screen.getByText('1 campagne')).exists();
  });

  test('it should display reset filters button', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::Filter::Filters
        @onFilter={{this.triggerFilteringSpy}}
        @onClickStatusFilter={{this.onClickStatusFilterSpy}}
        @onClearFilters={{this.onClickClearFiltersSpy}}
        @numResults={{1}} />`
    );

    // then
    assert.dom(screen.getByText(this.intl.t('pages.campaigns-list.filter.clear'))).exists();
  });

  module('when showing current user campaign list', function () {
    test('it should not show creator input', async function (assert) {
      // given / when
      const screen = await renderScreen(
        hbs`<Campaign::Filter::Filters
        @onFilter={{this.triggerFilteringSpy}}
        @onClickStatusFilter={{this.onClickStatusFilterSpy}}
        @onClearFilters={{this.onClickClearFiltersSpy}}
        @numResults={{1}}
        @listOnlyCampaignsOfCurrentUser={{true}} />`
      );

      // then
      assert.dom(screen.queryByLabelText('Rechercher un propriétaire')).doesNotExist();
    });
  });

  test('[A11Y] it should make filters container accessible', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::Filter::Filters
        @onFilter={{this.triggerFilteringSpy}}
        @onClickStatusFilter={{this.onClickStatusFilterSpy}}
        @onClearFilters={{this.onClickClearFiltersSpy}}
        @numResults={{1}} />`
    );

    // then
    assert.dom(screen.getByText(this.intl.t('pages.campaigns-list.filter.legend'))).exists();
  });
});
