import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CampaignOwner from 'pix-orga/components/campaign/create-form/campaign-owner';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::CampaignOwner', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const prescriber = store.createRecord('prescriber', {
      firstName: 'Adam',
      lastName: 'Troisjour',
      id: '1',
    });
    data.campaign = store.createRecord('campaign', { ownerId: prescriber.id });
    data.membersSortedByFullName = [prescriber];
  });

  test("it displays owner fields and auto complete owner field with owner's full name", async function (assert) {
    // when
    const screen = await render(
      <template>
        <CampaignOwner @campaign={{data.campaign}} @membersSortedByFullName={{data.membersSortedByFullName}} />
      </template>,
    );

    assert.dom(screen.getByText(t('pages.campaign-creation.owner.info'))).exists();
    assert.dom(screen.getAllByText(t('pages.campaign-creation.owner.title'))[0]).exists();
    await click(screen.getByLabelText(t('pages.campaign-creation.owner.label'), { exact: false }));

    await screen.findByRole('listbox');

    // then
    assert.dom(screen.getByRole('option', { name: 'Adam Troisjour', selected: true })).exists();
  });

  test('it updates campaign owner on select', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const secondMember = store.createRecord('prescriber', {
      firstName: 'Jean',
      lastName: 'Dupont',
      id: '2',
    });
    data.membersSortedByFullName = [...data.membersSortedByFullName, secondMember];

    // when
    const screen = await render(
      <template>
        <CampaignOwner @campaign={{data.campaign}} @membersSortedByFullName={{data.membersSortedByFullName}} />
      </template>,
    );
    await click(screen.getByLabelText(t('pages.campaign-creation.owner.label'), { exact: false }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Jean Dupont' }));

    // then
    assert.strictEqual(data.campaign.ownerId, '2');
  });
});
