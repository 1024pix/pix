import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import { clickByName, fillByLabel, render as renderScreen } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import { t } from 'ember-intl/test-support';

module('Integration | Component | Campaign::Filter::Filters', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('triggerFilteringSpy', () => {});
    this.set('onClickClearFiltersSpy', sinon.stub());
  });

  test('it should display filters', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::Filter::Filters
  @onFilter={{this.triggerFilteringSpy}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
/>`
    );

    // then
    assert.dom(screen.getByText('Filtres')).exists();
    assert.dom(screen.getByLabelText('Rechercher une campagne')).exists();
    assert.dom(screen.getByLabelText('Rechercher un propriétaire')).exists();
    assert.dom(screen.getByLabelText('Archivées')).exists();
    assert.dom(screen.getByLabelText('Actives')).exists();
    assert.dom(screen.getByText('1 campagne')).exists();
  });

  module('With clear all filters button', function () {
    test('it should reset all filters on button clear filters click', async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::Filter::Filters
  @onFilter={{this.triggerFilteringSpy}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
/>`
      );

      // When
      await clickByName(this.intl.t('pages.campaigns-list.filter.clear'));

      // then
      sinon.assert.called(this.onClickClearFiltersSpy);
      assert.ok(true);
    });
  });

  module('when showing current user campaign list', function () {
    test('it should not show creator input', async function (assert) {
      // given / when
      const screen = await renderScreen(
        hbs`<Campaign::Filter::Filters
  @onFilter={{this.triggerFilteringSpy}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
  @listOnlyCampaignsOfCurrentUser={{true}}
/>`
      );

      // then
      assert.dom(screen.queryByLabelText('Rechercher un propriétaire')).doesNotExist();
    });
  });

  test('it triggers the filter when a text is searched for campaign name', async function (assert) {
    // given
    const triggerFiltering = sinon.stub();
    this.set('triggerFiltering', triggerFiltering);

    // when
    await renderScreen(
      hbs`<Campaign::Filter::Filters
  @onFilter={{this.triggerFiltering}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
/>`
    );

    await fillByLabel(t('pages.campaigns-list.filter.by-name'), 'Sal');

    // then
    assert.ok(triggerFiltering.calledWith('name', 'Sal'));
  });

  test('it triggers the filter when a text is searched for owner', async function (assert) {
    // given
    const triggerFiltering = sinon.stub();
    this.set('triggerFiltering', triggerFiltering);

    // when
    await renderScreen(
      hbs`<Campaign::Filter::Filters
  @onFilter={{this.triggerFiltering}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
/>`
    );

    await fillByLabel(t('pages.campaigns-list.filter.by-owner'), 'Sal');

    // then
    assert.ok(triggerFiltering.calledWith('ownerName', 'Sal'));
  });

  test('[A11Y] it should make filters container accessible', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::Filter::Filters
  @onFilter={{this.triggerFilteringSpy}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
/>`
    );

    // then
    assert.dom(screen.getByText(this.intl.t('pages.campaigns-list.filter.legend'))).exists();
  });
});
