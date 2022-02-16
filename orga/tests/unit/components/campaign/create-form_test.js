import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import Service from '@ember/service';
import sinon from 'sinon';
import { setupIntl, t } from 'ember-intl/test-support';

module('Unit | Component | Campaign::CreateForm', (hooks) => {
  setupTest(hooks);
  setupIntl(hooks);

  module('#categories', function () {
    module('when this a target profile without OTHER category', function () {
      test('should sort categories in alphabetic order', async function (assert) {
        // given
        const targetProfiles = [
          {
            category: 'SUBJECT',
            name: 'Accès simplifié',
          },
          {
            category: 'CUSTOM',
            name: 'PC sur mesure',
          },
          {
            category: 'PREDEFINED',
            name: 'PC prédéfini',
          },
        ];
        class CurrentUserStub extends Service {
          organization = { canCollectProfiles: true };
          prescriber = { id: 1 };
        }
        this.owner.lookup('service:intl').setLocale('fr');
        this.owner.register('service:current-user', CurrentUserStub);
        const component = await createGlimmerComponent('component:campaign/create-form', {
          targetProfiles,
        });
        //when
        const allCategories = await component.categories;

        //then
        const expectedOrder = [
          {
            name: 'PREDEFINED',
            translation: t('pages.campaign-creation.tags.PREDEFINED'),
          },
          {
            name: 'CUSTOM',
            translation: t('pages.campaign-creation.tags.CUSTOM'),
          },
          {
            name: 'SUBJECT',
            translation: t('pages.campaign-creation.tags.SUBJECT'),
          },
        ];
        assert.deepEqual(allCategories, expectedOrder);
      });
    });

    module('when this a target profile with OTHER category', function () {
      test('should sort categories in alphabetic order and put the other category at the end.', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          organization = { canCollectProfiles: true };
          prescriber = { id: 1 };
        }
        this.owner.lookup('service:intl').setLocale('fr');
        this.owner.register('service:current-user', CurrentUserStub);
        const targetProfiles = [
          {
            category: 'SUBJECT',
            name: 'Accès simplifié',
          },
          {
            category: 'CUSTOM',
            name: 'PC sur mesure',
          },
          {
            category: 'PREDEFINED',
            name: 'PC prédéfini',
          },
          {
            category: 'OTHER',
            name: 'PC autre',
          },
        ];

        const component = await createGlimmerComponent('component:campaign/create-form', {
          targetProfiles,
        });

        //when
        const allCategories = await component.categories;

        //then
        const expectedOrder = [
          {
            name: 'PREDEFINED',
            translation: t('pages.campaign-creation.tags.PREDEFINED'),
          },
          {
            name: 'CUSTOM',
            translation: t('pages.campaign-creation.tags.CUSTOM'),
          },
          {
            name: 'SUBJECT',
            translation: t('pages.campaign-creation.tags.SUBJECT'),
          },
          {
            name: 'OTHER',
            translation: t('pages.campaign-creation.tags.OTHER'),
          },
        ];
        assert.deepEqual(allCategories, expectedOrder);
      });
    });
  });

  module('#onChangeCampaignOwner', function () {
    test('should set new owner id', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = { canCollectProfiles: true };
        prescriber = { id: 1 };
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const getStub1 = sinon.stub();
      getStub1.withArgs('fullName').returns('Remy Fasol');
      getStub1.withArgs('id').returns(1);
      const getStub2 = sinon.stub();
      getStub2.withArgs('fullName').returns('Thierry Golo');
      getStub2.withArgs('id').returns(7);
      const membersSortedByFullName = [{ get: getStub1 }, { get: getStub2 }];
      const component = await createGlimmerComponent('component:campaign/create-form', { membersSortedByFullName });
      const event = { target: { value: 'Thierry Golo' } };

      //when
      await component.onChangeCampaignOwner(event);

      //then
      assert.deepEqual(component.campaign.ownerId, 7);
    });
  });
});
