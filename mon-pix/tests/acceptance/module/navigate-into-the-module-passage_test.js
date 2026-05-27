import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL, waitUntil } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | Module | Routes | navigateIntoTheModulePassage', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when user arrives on the module passage page', function () {
    test('should display only the first lesson grain', async function (assert) {
      // given
      const sections = _createSections(server);

      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        shortId: 'm4tth7a5',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        sections,
      });

      server.create('passage', {
        moduleId: 'bien-ecrire-son-adresse-mail',
      });

      // when
      const screen = await visit('/modules/m4tth7a5/bien-ecrire-son-adresse-mail/passage');

      // then
      assert.strictEqual(screen.getAllByRole('article').length, 1);
      assert.dom(screen.getByRole('button', { name: 'Continuer' })).exists({ count: 1 });
    });
  });

  module('when user clicks on continue button', function () {
    module('when the grain displayed is not the last', function () {
      test('should display the continue button', async function (assert) {
        // given
        const sections = _createSections(server);

        server.create('module', {
          id: 'bien-ecrire-son-adresse-mail',
          shortId: 'm4tth7a5',
          slug: 'bien-ecrire-son-adresse-mail',
          title: 'Bien écrire son adresse mail',
          sections,
        });

        // when
        const screen = await visit('/modules/m4tth7a5/bien-ecrire-son-adresse-mail/passage');

        // then
        assert.dom(screen.getByRole('button', { name: 'Continuer' })).exists({ count: 1 });

        // when
        await clickByName('Continuer');

        // then
        assert.dom(screen.getByRole('heading', { name: 'Étape 2 sur 3', level: 3 })).exists();
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).exists();
      });
    });

    module('when the grain displayed is the last', function () {
      test('should not display continue button', async function (assert) {
        // given
        const sections = _createSections(server);

        server.create('module', {
          id: 'bien-ecrire-son-adresse-mail',
          shortId: 'm4tth7a5',
          slug: 'bien-ecrire-son-adresse-mail',
          title: 'Bien écrire son adresse mail',
          sections,
        });

        // when
        const screen = await visit('/modules/m4tth7a5/bien-ecrire-son-adresse-mail/passage');

        // then
        assert.dom(screen.getByRole('button', { name: 'Continuer' })).exists({ count: 1 });

        // when
        await clickByName('Continuer');
        await clickByName('Continuer');

        // then
        assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
      });
    });

    test('should navigate to recap page when terminate is clicked', async function (assert) {
      // given
      const text1 = {
        id: 'elementId-1',
        type: 'text',
        content: 'content-1',
        tag: ' ',
      };
      const section1 = server.create('section', {
        id: 'sectionId-1',
        type: 'blank',
        grains: [
          {
            id: 'grainId-1',
            title: 'title grain 1',
            components: [
              {
                type: 'element',
                element: text1,
              },
            ],
          },
        ],
      });
      const module = server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        shortId: 'm4tth7a5',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        sections: [section1],
      });
      server.create('passage', {
        id: '122',
        moduleId: module.slug,
      });

      // when
      const screen = await visit('/modules/m4tth7a5/bien-ecrire-son-adresse-mail/passage');

      // then
      assert.dom(screen.getByRole('button', { name: 'Terminer' })).exists({ count: 1 });

      // when
      await clickByName('Terminer');

      // then
      await waitUntil(() => {
        return screen.queryByRole('heading', { name: 'Module terminé !', level: 1 });
      });

      assert.strictEqual(currentURL(), '/modules/m4tth7a5/bien-ecrire-son-adresse-mail/recap');
    });
  });

  module('when the user moves on to the next section', function () {
    test('should change the state of navigation section buttons', async function (assert) {
      // given
      const sections = _createSections(server);

      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        shortId: 'm4tth7a5',
        slug: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        sections,
      });

      // when
      const screen = await visit('/modules/m4tth7a5/bien-ecrire-son-adresse-mail/passage');
      const navigation = screen.getByRole('navigation', { name: t('navigation.nav-bar.aria-label') });
      const firstSectionButton = within(navigation).getByRole('button', {
        name: `${t('pages.modulix.navigation.buttons.aria-label.steps', {
          indexSection: 1,
          totalSections: 2,
        })} ${t('pages.modulix.navigation.buttons.aria-label.enabled', {
          sectionTitle: 'Explorer pour comprendre',
        })}`,
      });
      const secondSectionButton = within(navigation).getByRole('button', {
        name: `${t('pages.modulix.navigation.buttons.aria-label.steps', {
          indexSection: 2,
          totalSections: 2,
        })} ${t('pages.modulix.navigation.buttons.aria-label.disabled')}`,
      });

      // then
      assert.dom(firstSectionButton).hasAttribute('aria-current', 'step');
      assert.dom(firstSectionButton).hasNoAttribute('aria-disabled');

      assert.dom(secondSectionButton).hasAttribute('aria-current', 'false');
      assert.dom(secondSectionButton).hasAttribute('aria-disabled', 'true');

      //when
      await click(screen.getByRole('button', { name: 'Continuer' }));
      await click(screen.getByRole('button', { name: 'Continuer' }));

      // then
      assert.dom(firstSectionButton).hasAttribute('aria-current', 'false');
      assert.dom(firstSectionButton).hasNoAttribute('aria-disabled');

      assert.dom(secondSectionButton).hasAttribute('aria-current', 'step');
      assert.dom(secondSectionButton).hasNoAttribute('aria-disabled');
    });
  });
});

const text1 = {
  id: 'elementId-1',
  type: 'text',
  content: 'content-1',
  tag: ' ',
};

const text2 = {
  id: 'elementId-2',
  type: 'text',
  content: 'content-2',
  tag: ' ',
};

const text3 = {
  id: 'elementId-3',
  type: 'text',
  content: 'content-3',
  tag: ' ',
};

function _createSections(server) {
  const section1 = server.create('section', {
    id: 'sectionId-1',
    type: 'explore-to-understand',
    grains: [
      {
        id: 'grainId-1',
        title: 'title grain 1',
        components: [
          {
            type: 'element',
            element: text1,
          },
        ],
      },
      {
        id: 'grainId-2',
        title: 'title grain 2',
        components: [
          {
            type: 'element',
            element: text2,
          },
        ],
      },
    ],
  });
  const section2 = server.create('section', {
    id: 'sectionId-2',
    type: 'go-further',
    grains: [
      {
        id: 'grainId-3',
        title: 'title grain 3',
        components: [
          {
            type: 'element',
            element: text3,
          },
        ],
      },
    ],
  });

  return [section1, section2];
}
