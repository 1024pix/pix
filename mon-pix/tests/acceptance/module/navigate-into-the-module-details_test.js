import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Module | Routes | navigateIntoTheModuleDetails', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user arrive on the module details page', function () {
    test('should display the link to passage button', async function (assert) {
      // given
      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        grains: [],
        details: {
          image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
          description: 'Description',
          duration: 'duration',
          level: 'level',
          objectives: ['Objectif #1'],
        },
      });

      // when
      const screen = await visit('/modules/bien-ecrire-son-adresse-mail/details');

      // then
      assert
        .dom(screen.getByRole('link', { name: this.intl.t('pages.modulix.details.startModule') }))
        .exists({ count: 1 });
    });

    test('should navigate to passage page by clicking on start module button', async function (assert) {
      // given
      const grain = server.create('grain', {
        id: 'grain1',
      });

      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        grains: [grain],
        details: {
          image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
          description: 'Description',
          duration: 'duration',
          level: 'level',
          objectives: ['Objectif #1'],
        },
      });

      // when
      const screen = await visit('/modules/bien-ecrire-son-adresse-mail/details');
      await click(screen.getByRole('link', { name: this.intl.t('pages.modulix.details.startModule') }));

      // then
      assert.strictEqual(currentURL(), '/modules/bien-ecrire-son-adresse-mail/passage');
    });
  });
});
