import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Module | Routes | navigateIntoTheModuleDetails', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user arrives on the module details page', function () {
    test('should display the link to passage button', async function (assert) {
      // given
      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        shortId: 'm4tth7a5',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        sections: [],
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description: '<p>Description</p>',
          duration: 'duration',
          level: 'level',
          objectives: ['Objectif #1'],
        },
      });

      // when
      const screen = await visit('/modules/m4tth7a5/bien-ecrire-son-adresse-mail/details');
      // then
      assert.dom(screen.getByRole('button', { name: t('pages.modulix.details.startModule') })).exists({ count: 1 });
    });

    test('should navigate to passage page by clicking on start module button', async function (assert) {
      // given
      const section = server.create('section', {
        id: 'section1',
        type: 'blank',
        grains: [{ id: 'grain1', components: [] }],
      });

      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        shortId: 'm4tth7a5',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        sections: [section],
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description: '<p>Description</p>',
          duration: 'duration',
          level: 'level',
          objectives: ['Objectif #1'],
        },
      });

      // when
      const screen = await visit('/modules/m4tth7a5/bien-ecrire-son-adresse-mail/details');
      await click(screen.getByRole('button', { name: t('pages.modulix.details.startModule') }));

      // then
      assert.strictEqual(currentURL(), '/modules/m4tth7a5/bien-ecrire-son-adresse-mail/passage');
    });
  });
});
