import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Filter::CampaignFilters', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('triggerFilteringSpy', () => {});
    this.set('onClickClearFiltersSpy', sinon.stub());
  });

  test('it should display filters', async function (assert) {
    // when
    const screen = await render(
      hbs`<Campaign::Filter::CampaignFilters
  @onFilter={{this.triggerFilteringSpy}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
/>`,
    );

    // then
    assert.dom(screen.getByText(t('common.filters.title'))).exists();
    assert.dom(screen.getByLabelText(t('pages.campaigns-list.filter.by-name'))).exists();
    assert.dom(screen.getByLabelText(t('pages.campaigns-list.filter.by-owner'))).exists();
    assert.dom(screen.getByLabelText(t('pages.campaigns-list.action.campaign.label'))).exists();
    assert.dom(screen.getByText(t('pages.campaigns-list.filter.results', { total: 1 }))).exists();
  });

  module('With clear all filters button', function () {
    test('it should reset all filters on button clear filters click', async function (assert) {
      //giver
      this.set('nameFilter', 'toto');
      // when
      await render(
        hbs`<Campaign::Filter::CampaignFilters
  @onFilter={{this.triggerFilteringSpy}}
  @nameFilter={{this.nameFilter}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
/>`,
      );

      // When
      await clickByName(t('common.filters.actions.clear'));

      // then
      sinon.assert.called(this.onClickClearFiltersSpy);
      assert.ok(true);
    });
  });

  module('when showing current user campaign list', function () {
    test('it should not show creator input', async function (assert) {
      // given / when
      const screen = await render(
        hbs`<Campaign::Filter::CampaignFilters
  @onFilter={{this.triggerFilteringSpy}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
  @listOnlyCampaignsOfCurrentUser={{true}}
/>`,
      );

      // then
      assert.dom(screen.queryByLabelText(t('pages.campaigns-list.filter.by-owner'))).doesNotExist();
    });
  });

  test('it triggers the filter when a text is searched for campaign name', async function (assert) {
    // given
    const triggerFiltering = sinon.stub();
    this.set('triggerFiltering', triggerFiltering);

    // when
    await render(
      hbs`<Campaign::Filter::CampaignFilters
  @onFilter={{this.triggerFiltering}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
/>`,
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
    await render(
      hbs`<Campaign::Filter::CampaignFilters
  @onFilter={{this.triggerFiltering}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
/>`,
    );

    await fillByLabel(t('pages.campaigns-list.filter.by-owner'), 'Sal');

    // then
    assert.ok(triggerFiltering.calledWith('ownerName', 'Sal'));
  });

  test('[A11Y] it should make filters container accessible', async function (assert) {
    // when
    const screen = await render(
      hbs`<Campaign::Filter::CampaignFilters
  @onFilter={{this.triggerFilteringSpy}}
  @onClearFilters={{this.onClickClearFiltersSpy}}
  @numResults={{1}}
/>`,
    );

    // then
    assert.dom(screen.getByLabelText(t('pages.campaigns-list.filter.legend'))).exists();
  });
});
