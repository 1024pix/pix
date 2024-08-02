import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Routes | join', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  module('when a user wants to join a certification center', function () {
    test('it should allow the user to create his account and display the dashboard page', async function (assert) {
      // given
      const certificationCenterInvitation = server.create('certification-center-invitation', {
        id: 1,
        certificationCenterName: 'Collège Truffaut',
      });

      // when
      const screen = await visit(`/rejoindre?invitationId=${certificationCenterInvitation.id}&code=ABCDEF123`);
      await fillIn(screen.getByRole('textbox', { name: 'Prénom' }), 'Prénom');
      await fillIn(screen.getByRole('textbox', { name: 'Nom' }), 'Nom');
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'p.n@email.com');
      await fillIn(screen.getByLabelText('Mot de passe'), 'Pa$$w0rd');
      await click(
        screen.getByRole('checkbox', {
          name: "J'accepte les conditions d'utilisation de Pix et la politique de confidentialité",
        }),
      );
      await clickByName(`Je m'inscris`);
      await clickByName(`J’accepte les conditions d’utilisation`);

      // then
      assert.strictEqual(currentURL(), '/sessions/liste');
      assert.dom(screen.getByText('Collège Truffaut', { exact: false })).exists();
    });
  });

  module('when a user tries to join a certification center', function () {
    module('with a cancelled invitation link', function () {
      test('it should redirect the user to the login page and display an error message', async function (assert) {
        // given
        const certificationCenterInvitation = server.create('certification-center-invitation', {
          id: 1,
          certificationCenterName: 'Super Centre de Certif',
        });

        // when
        const screen = await visit(`/rejoindre?invitationId=${certificationCenterInvitation.id}&code=CANCELLED`);

        // then
        assert.strictEqual(currentURL(), '/connexion');
        assert
          .dom(
            screen.getByText((content) => {
              return (
                content === 'Cette invitation n’est plus valide.Contactez l’administrateur de votre espace Pix Certif.'
              );
            }),
          )
          .exists();
      });
    });

    module('with an already accepted invitation link', function () {
      test('it should redirect the user to the login page and display an error message', async function (assert) {
        // given
        const certificationCenterInvitation = server.create('certification-center-invitation', {
          id: 1,
          certificationCenterName: 'Super Centre de Certif',
        });

        // when
        const screen = await visit(`/rejoindre?invitationId=${certificationCenterInvitation.id}&code=ACCEPTED`);

        // then
        assert.strictEqual(currentURL(), '/connexion');
        assert
          .dom(
            screen.getByText((content) => {
              return (
                content ===
                'Cette invitation a déjà été acceptée.Connectez-vous ou contactez l’administrateur de votre espace Pix Certif.'
              );
            }),
          )
          .exists();
      });
    });

    module('when current url does not contain french tld (.fr)', function () {
      module('When accessing the login page with "Français" as default language', function () {
        test('displays the login page with "Français" as selected language', async function (assert) {
          // given
          const certificationCenterInvitation = server.create('certification-center-invitation', {
            id: 1,
            certificationCenterName: 'Super Centre de Certif',
          });
          const path = `/rejoindre?code=ABCDEF123&invitationId=${certificationCenterInvitation.id}`;

          // when
          const screen = await visit(path);

          // then
          assert.strictEqual(currentURL(), path);
          assert.dom(screen.getByRole('heading', { name: 'Je m’inscris', level: 1 })).exists();
        });

        module('When the user select "English" as his language', function () {
          test('displays the login page with "English" as selected language', async function (assert) {
            // given
            const certificationCenterInvitation = server.create('certification-center-invitation', {
              id: 1,
              certificationCenterName: 'Super Centre de Certif',
            });
            const path = `/rejoindre?code=ABCDEF123&invitationId=${certificationCenterInvitation.id}`;

            // when
            const screen = await visit(path);
            await click(screen.getByRole('button', { name: 'Sélectionnez une langue' }));
            await screen.findByRole('listbox');
            await click(screen.getByRole('option', { name: 'English' }));

            // then
            assert.strictEqual(currentURL(), path);
            assert.dom(screen.getByRole('heading', { name: 'Sign up', level: 1 })).exists();
          });
        });
      });

      module('When accessing the login page with "English" as selected language', function () {
        test('displays the login page with "English"', async function (assert) {
          // given
          const certificationCenterInvitation = server.create('certification-center-invitation', {
            id: 1,
            certificationCenterName: 'Super Centre de Certif',
          });
          const path = `/rejoindre?code=ABCDEF123&invitationId=${certificationCenterInvitation.id}&lang=en`;

          // when
          const screen = await visit(path);

          // then
          assert.strictEqual(currentURL(), path);
          assert.dom(screen.getByRole('heading', { name: 'Sign up', level: 1 })).exists();
        });

        module('When the user select "Français" as his language', function () {
          test('displays the login page with "Français" as selected language', async function (assert) {
            // given
            const certificationCenterInvitation = server.create('certification-center-invitation', {
              id: 1,
              certificationCenterName: 'Super Centre de Certif',
            });
            const path = `/rejoindre?invitationId=${certificationCenterInvitation.id}&code=ABCDEF123&lang=en`;
            const pathWithoutLangParam = `/rejoindre?code=ABCDEF123&invitationId=${certificationCenterInvitation.id}`;

            // when
            const screen = await visit(path);
            await click(screen.getByRole('button', { name: 'Select a language' }));
            await screen.findByRole('listbox');
            await click(screen.getByRole('option', { name: 'Français' }));

            // then
            assert.strictEqual(currentURL(), pathWithoutLangParam);
            assert.dom(screen.getByRole('heading', { name: 'Je m’inscris', level: 1 })).exists();
          });
        });
      });
    });
  });
});
