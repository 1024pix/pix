import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import Service from '@ember/service';
import { setupIntl } from 'ember-intl/test-support';

module('Unit | Component | Campaign::CreateForm', (hooks) => {
  setupTest(hooks);
  setupIntl(hooks);

  module('#onChangeCampaignOwner', function () {
    test('should set new owner id', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        prescriber = { id: 1 };
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const membersSortedByFullName = [
        { id: 1, fullName: 'Remy Fasol' },
        { id: 7, fullName: 'Thierry Golo' },
      ];
      const component = await createGlimmerComponent('component:campaign/create-form', {
        campaign: {},
        membersSortedByFullName,
        targetProfiles: [],
      });
      const newOwnerId = 7;

      //when
      await component.onChangeCampaignOwner(newOwnerId);

      //then
      assert.deepEqual(component.campaign.ownerId, 7);
    });
  });

  module('#selectMultipleSendingsStatus', function () {
    test('set to true', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        prescriber = { id: 1 };
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const component = await createGlimmerComponent('component:campaign/create-form', {
        campaign: {},
        targetProfiles: [],
        membersSortedByFullName: [{ id: 1, fullName: 'Just me' }],
      });

      //when
      await component.selectMultipleSendingsStatus(true);

      //then
      assert.true(component.campaign.multipleSendings);
    });

    test('set to false', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        prescriber = { id: 1 };
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const component = await createGlimmerComponent('component:campaign/create-form', {
        campaign: {},
        targetProfiles: [],
        membersSortedByFullName: [{ id: 1, fullName: 'Just me' }],
      });

      //when
      await component.selectMultipleSendingsStatus(false);

      //then
      assert.false(component.campaign.multipleSendings);
    });
  });
});
