import { render, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import LtiCampaignSelection from 'pix-orga/templates/lti-campaign-selection';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Template | lti-campaign-selection', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders template', async function (assert) {
    // given
    const model = [
      {
        name: 'Campaign 1',
        type: 'ASSESSMENT',
        organizationName: 'Orga 1',
        code: 'CAMP1',
      },
      {
        name: 'Campaign 2',
        type: 'PROFILES_COLLECTION',
        organizationName: 'Orga 2',
        code: 'CAMP2',
      },
    ];

    // when
    const screen = await render(<template><LtiCampaignSelection @model={{model}} /></template>);

    // then
    assert.ok(screen.getByRole('heading', { name: t('pages.lti-campaigns.title'), level: 1 }));

    const rows = screen.getAllByRole('row');
    assert.ok(within(rows[0]).getByRole('columnheader', { name: t('pages.lti-campaigns.columns.campaign-name') }));
    assert.ok(within(rows[0]).getByRole('columnheader', { name: t('pages.lti-campaigns.columns.campaign-type') }));
    assert.ok(within(rows[0]).getByRole('columnheader', { name: t('pages.lti-campaigns.columns.organization') }));
    assert.ok(within(rows[0]).getByRole('columnheader', { name: t('pages.lti-campaigns.columns.code') }));

    assert.ok(within(rows[1]).getByRole('cell', { name: 'Campaign 1' }));
    assert.ok(within(rows[1]).getByRole('cell', { name: 'Évaluer' }));
    assert.ok(within(rows[1]).getByRole('cell', { name: 'Orga 1' }));
    assert.ok(within(rows[1]).getByRole('cell', { name: 'CAMP1' }));

    assert.ok(within(rows[2]).getByRole('cell', { name: 'Campaign 2' }));
    assert.ok(within(rows[2]).getByRole('cell', { name: 'Collecter' }));
    assert.ok(within(rows[2]).getByRole('cell', { name: 'Orga 2' }));
    assert.ok(within(rows[2]).getByRole('cell', { name: 'CAMP2' }));
  });
});
