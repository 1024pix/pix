import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import CampaignFilters from 'pix-orga/components/campaign/filter/campaign-filters';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Filter::CampaignFilters', function (hooks) {
  setupIntlRenderingTest(hooks);

  const triggerFilteringSpy = () => {};
  const onClickClearFiltersSpy = sinon.stub();

  test('it should display filters', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CampaignFilters
          @onFilter={{triggerFilteringSpy}}
          @onClearFilters={{onClickClearFiltersSpy}}
          @numResults={{1}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByText(t('common.filters.title'))).exists();
    assert.dom(screen.getByLabelText(t('pages.campaigns-list.filter.by-name'))).exists();
    assert.dom(screen.getByLabelText(t('pages.campaigns-list.filter.by-owner'))).exists();
    assert.dom(screen.getByRole('radiogroup', { name: t('pages.campaigns-list.action.campaign.label') })).exists();
    assert.dom(screen.getByText(t('pages.campaigns-list.filter.results', { total: 1 }))).exists();
  });

  module('With clear all filters button', function () {
    test('it should reset all filters on button clear filters click', async function (assert) {
      //given
      const nameFilter = 'toto';
      // when
      await render(
        <template>
          <CampaignFilters
            @onFilter={{triggerFilteringSpy}}
            @nameFilter={{nameFilter}}
            @onClearFilters={{onClickClearFiltersSpy}}
            @numResults={{1}}
          />
        </template>,
      );

      // When
      await clickByName(t('common.filters.actions.clear'));

      // then
      sinon.assert.called(onClickClearFiltersSpy);
      assert.ok(true);
    });
  });

  module('when showing current user campaign list', function () {
    test('it should not show creator input', async function (assert) {
      // given / when
      const screen = await render(
        <template>
          <CampaignFilters
            @onFilter={{triggerFilteringSpy}}
            @onClearFilters={{onClickClearFiltersSpy}}
            @numResults={{1}}
            @listOnlyCampaignsOfCurrentUser={{true}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByLabelText(t('pages.campaigns-list.filter.by-owner'))).doesNotExist();
    });
  });

  test('it triggers the filter when a text is searched for campaign name', async function (assert) {
    // given
    const triggerFiltering = sinon.stub();

    // when
    await render(
      <template>
        <CampaignFilters @onFilter={{triggerFiltering}} @onClearFilters={{onClickClearFiltersSpy}} @numResults={{1}} />
      </template>,
    );

    await fillByLabel(t('pages.campaigns-list.filter.by-name'), 'Sal');

    // then
    assert.ok(triggerFiltering.calledWith('name', 'Sal'));
  });

  test('it triggers the filter when a text is searched for owner', async function (assert) {
    // given
    const triggerFiltering = sinon.stub();

    // when
    await render(
      <template>
        <CampaignFilters @onFilter={{triggerFiltering}} @onClearFilters={{onClickClearFiltersSpy}} @numResults={{1}} />
      </template>,
    );

    await fillByLabel(t('pages.campaigns-list.filter.by-owner'), 'Sal');

    // then
    assert.ok(triggerFiltering.calledWith('ownerName', 'Sal'));
  });

  test('[A11Y] it should make filters container accessible', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CampaignFilters
          @onFilter={{triggerFilteringSpy}}
          @onClearFilters={{onClickClearFiltersSpy}}
          @numResults={{1}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByLabelText(t('pages.campaigns-list.filter.legend'))).exists();
  });
});
