import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | details', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('should visit and include the module title and footer', async function (assert) {
    // given
    const module = server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      shortId: 'm4tth7as',
      slug: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      isBeta: false,
      details: {
        image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: 12,
        level: 'novice',
        objectives: ['Écrire une adresse mail correctement, en évitant les erreurs courantes'],
      },
      grains: [],
    });

    // when
    const screen = await visit('/modules/m4tth7as/bien-ecrire-son-adresse-mail/details');
    // then
    assert.strictEqual(currentURL(), '/modules/m4tth7as/bien-ecrire-son-adresse-mail/details');
    assert.ok(document.title.includes(module.title));
    assert.dom(screen.queryByRole('alert')).doesNotExist();
    assert.dom(screen.queryByText(t('pages.modulix.beta-banner'))).doesNotExist();
    assert.dom(screen.getByRole('contentinfo')).exists();
  });

  module('when module is beta', function () {
    test('should display a beta banner', async function (assert) {
      // given
      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        shortId: 'm4tth7as',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        isBeta: true,
        details: {
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          description:
            'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
          duration: 12,
          level: 'novice',
          objectives: ['Écrire une adresse mail correctement, en évitant les erreurs courantes'],
        },
        grains: [],
      });

      // when
      const screen = await visit('/modules/m4tth7as/bien-ecrire-son-adresse-mail/details');

      // then
      assert.dom(screen.getByRole('alert')).exists();
      assert.dom(screen.getByText(t('pages.modulix.beta-banner'))).exists();
    });
  });
  test('should redirect /modules/:slug to /modules/:slug/details', async function (assert) {
    // given
    const section = server.create('section', {
      id: 'sectionId-1',
      grains: [
        {
          id: 'grain1',
          components: [],
        },
      ],
    });
    server.create('module', {
      id: 'bien-ecrire-son-adresse-mail',
      shortId: 'm4tth7as',
      slug: 'bien-ecrire-son-adresse-mail',
      title: 'Bien écrire son adresse mail',
      details: {
        image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
        description:
          'Apprendre à rédiger correctement une adresse e-mail pour assurer une meilleure communication et éviter les erreurs courantes.',
        duration: 12,
        level: 'novice',
        objectives: ['Écrire une adresse mail correctement, en évitant les erreurs courantes'],
      },
      sections: [section],
    });

    // when
    await visit('/modules/m4tth7as/bien-ecrire-son-adresse-mail');

    // then
    assert.strictEqual(currentURL(), '/modules/m4tth7as/bien-ecrire-son-adresse-mail/details');
  });
});
