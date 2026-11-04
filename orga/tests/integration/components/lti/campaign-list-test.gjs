import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CampaignList from 'pix-orga/components/lti/campaign-list';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Lti | CampaignList', function (hooks) {
  setupIntlRenderingTest(hooks);

  const campaigns = [
    {
      id: '1',
      name: 'Campagne évaluation',
      type: 'ASSESSMENT',
      organizationName: 'Orga A',
      code: 'ABC123',
      description: 'Description évaluation',
    },
    {
      id: '2',
      name: 'Campagne collecte',
      type: 'PROFILES_COLLECTION',
      organizationName: 'Orga B',
      code: 'DEF456',
      description: 'Description collecte',
    },
  ];

  test('it should display a table with caption and column headers', async function (assert) {
    // when
    const screen = await render(<template><CampaignList @campaigns={{campaigns}} /></template>);

    // then
    const table = screen.getByRole('table', { name: t('pages.lti-campaigns.title') });
    assert.dom(table).exists();
    assert.ok(within(table).getByRole('columnheader', { name: t('pages.lti-campaigns.columns.campaign-name') }));
    assert.ok(within(table).getByRole('columnheader', { name: t('pages.lti-campaigns.columns.campaign-type') }));
    assert.ok(within(table).getByRole('columnheader', { name: t('pages.lti-campaigns.columns.organization') }));
    assert.ok(within(table).getByRole('columnheader', { name: t('pages.lti-campaigns.columns.code') }));
  });

  test('it should display campaigns details', async function (assert) {
    // when
    const screen = await render(<template><CampaignList @campaigns={{campaigns}} /></template>);

    // then
    const table = screen.getByRole('table');
    assert.ok(within(table).getByRole('cell', { name: 'Campagne évaluation' }));
    assert.ok(within(table).getByRole('cell', { name: 'Orga A' }));
    assert.ok(within(table).getByRole('cell', { name: 'ABC123' }));
    assert.ok(within(table).getByRole('cell', { name: 'Campagne collecte' }));
    assert.ok(within(table).getByRole('cell', { name: 'Orga B' }));
    assert.ok(within(table).getByRole('cell', { name: 'DEF456' }));
  });

  test('it should display the campaign type tags', async function (assert) {
    // when
    const screen = await render(<template><CampaignList @campaigns={{campaigns}} /></template>);

    // then
    const table = screen.getByRole('table');
    assert.ok(within(table).getByText(t('pages.lti-campaigns.campaign-types.ASSESSMENT')));
    assert.ok(within(table).getByText(t('pages.lti-campaigns.campaign-types.PROFILES_COLLECTION')));
  });

  test('it should not display the modal by default', async function (assert) {
    // when
    const screen = await render(<template><CampaignList @campaigns={{campaigns}} /></template>);

    // then
    assert.dom(screen.queryByRole('dialog')).doesNotExist();
  });

  test('it should open the modal with the campaign details when a row is clicked', async function (assert) {
    // given
    const screen = await render(<template><CampaignList @campaigns={{campaigns}} /></template>);

    // when
    await click(screen.getByRole('cell', { name: 'Campagne évaluation' }));

    // then
    const modal = screen.getByRole('dialog');
    assert.dom(modal).isVisible();
    assert.ok(within(modal).getByText(t('pages.lti-campaigns.modal-title')));
    assert.ok(within(modal).getByRole('heading', { name: 'Campagne évaluation' }));
    assert.ok(within(modal).getByText('Description évaluation'));
    assert.ok(within(modal).getByText(t('pages.lti-campaigns.campaign-types.ASSESSMENT')));
  });

  test('it should submit the selected campaign id to the LTI select-campaign endpoint', async function (assert) {
    // given
    const screen = await render(<template><CampaignList @campaigns={{campaigns}} /></template>);

    // when
    await click(screen.getByRole('cell', { name: 'Campagne collecte' }));

    // then
    const modal = screen.getByRole('dialog');
    const submitButton = within(modal).getByRole('button', { name: t('pages.lti-campaigns.select-campaign') });
    const form = submitButton.closest('form');
    assert.strictEqual(form.getAttribute('method'), 'POST');
    assert.strictEqual(form.getAttribute('action'), '/api/lti/select-campaign');
    assert.strictEqual(form.querySelector('input[name="campaignId"]').value, '2');
  });

  test('it should close the modal when the close button is clicked', async function (assert) {
    // given
    const screen = await render(<template><CampaignList @campaigns={{campaigns}} /></template>);
    await click(screen.getByRole('cell', { name: 'Campagne évaluation' }));
    assert.dom(screen.getByRole('dialog')).hasAttribute('open');

    // when
    await click(screen.getByRole('button', { name: /fermer/i }));

    // then
    assert.dom(screen.queryByRole('dialog', { hidden: true })).exists();
  });
});
