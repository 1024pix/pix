import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import Service from '@ember/service';

module('Unit | Component | Campaign::CreateForm', (hooks) => {
  setupTest(hooks);

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
            translation: 'Prédéfinie',
          },
          {
            name: 'CUSTOM',
            translation: 'Sur-mesure',
          },
          {
            name: 'SUBJECT',
            translation: 'Thématique',
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
            translation: 'Prédéfinie',
          },
          {
            name: 'CUSTOM',
            translation: 'Sur-mesure',
          },
          {
            name: 'SUBJECT',
            translation: 'Thématique',
          },
          {
            name: 'OTHER',
            translation: 'Autre',
          },
        ];
        assert.deepEqual(allCategories, expectedOrder);
      });
    });
  });
});
