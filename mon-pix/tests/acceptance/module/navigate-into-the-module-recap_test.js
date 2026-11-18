import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import { authenticate } from '../../helpers/authentication';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Module | Routes | navigateIntoTheModuleRecap', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  module('when user arrive on the module recap page', function (hooks) {
    let screen;
    hooks.beforeEach(async function () {
      const text = {
        id: '84726001-1665-457d-8f13-4a74dc4768ea',
        type: 'text',
        content: '<h4>content</h4>',
        tag: ' ',
      };
      user = server.create('user', 'withEmail');

      const section = server.create('section', {
        id: 'sectionId-1',
        grains: [
          {
            id: 'grain1',
            components: [{ type: 'element', element: text }],
          },
        ],
      });
      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        shortId: 'm4tth7a5',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        sections: [section],
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description: '<p>Description</p>',
          duration: 'duration',
          level: 'level',
          objectives: ['Objectif #1'],
        },
      });
      await authenticate(user);

      screen = await visit('/modules/m4tth7a5/bien-ecrire-son-adresse-mail/passage');
      await clickByName('Terminer');
    });

    test('should include the right page title', async function (assert) {
      // then
      assert.ok(document.title.includes(t('pages.modulix.recap.title')));
      assert.ok(screen.getByRole('heading', { level: 1, name: t('pages.modulix.recap.title') }));
    });

    test('should navigate to homepage by clicking on go to homepage button', async function (assert) {
      // when
      await click(screen.getByRole('link', { name: t('pages.modulix.recap.goToHomepage') }));

      // then
      assert.strictEqual(currentURL(), '/accueil');
    });
  });
});
