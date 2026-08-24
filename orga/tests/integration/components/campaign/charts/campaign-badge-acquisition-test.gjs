import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CampaignBadgeAcquisitions from 'pix-orga/components/campaign/charts/campaign-badge-acquisitions';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
module('Integration | Component | Campaign::Charts::BadgeAcquisitionCards', function (hooks) {
  setupIntlRenderingTest(hooks);
  let adapter;

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    adapter = store.adapterFor('campaign-stats');
  });

  module('When the campaign has badges acquired', function (hooks) {
    hooks.beforeEach(async function () {
      sinon.stub(adapter, 'getBadgeAcquisitions').resolves({
        data: {
          type: 'badge-acquisitions-statistics',
          id: '104997',
          attributes: {
            data: [
              {
                badge: {
                  id: 6001,
                  altMessage: '1 RT double critère Campaign',
                  imageUrl: 'https://images.pix.fr/badges/Logos_badge_Prêt-CléA_Num NEW 2020.svg',
                  title: '1 RT double critère Campaign',
                },
                count: 6,
                percentage: 86,
              },
              {
                badge: {
                  id: 6000,
                  altMessage: '1 RT double critère Campaign & Tubes',
                  imageUrl: 'https://images.pix.fr/badges/Logos_badge_Prêt-CléA_Num NEW 2020.svg',
                  title: '1 RT double critère Campaign & Tubes',
                },
                count: 3,
                percentage: 40,
              },
            ],
          },
        },
      });
    });
    test('It should display badges in the order received from controller', async function (assert) {
      //when
      const screen = await render(<template><CampaignBadgeAcquisitions /></template>);
      const list = await screen.findByRole('list');
      //then
      assert.dom(screen.getByText(t('cards.badges-acquisitions.title'))).exists();
      assert
        .dom(list)
        .hasText('1 RT double critère Campaign 6 obtenus (86%) 1 RT double critère Campaign & Tubes 3 obtenus (40%)');
    });
  });
});
