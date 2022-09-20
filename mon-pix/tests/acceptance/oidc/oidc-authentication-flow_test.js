/* eslint ember/no-classic-classes: 0 */

import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import setupIntl from '../../helpers/setup-intl';
import { expect } from 'chai';
import { Response } from 'miragejs';

describe('Acceptance | OIDC | authentication flow', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  context('when user is logged in to external provider', function () {
    context('when user logs out with logout url', function () {
      context('when sso account reconciliation feature toggle is enabled', function () {
        it('should redirect the user to logout url', async function () {
          // given
          const response = new Response(
            200,
            {},
            {
              data: {
                type: 'feature-toggles',
                id: '0',
                attributes: {
                  'is-sso-account-reconciliation-enabled': true,
                },
              },
            }
          );
          server.get('/feature-toggles', () => response);
          const screen = await visit('/connexion/oidc-partner?code=code&state=state');

          // when
          await click(
            screen.getByLabelText('Accepter les conditions d’utilisation de Pix et la politique de confidentialité')
          );
          await click(screen.getByRole('button', { name: 'Je créé mon compte' }));
          await click(screen.getByRole('button', { name: 'Lloyd Consulter mes informations' }));
          await click(screen.getByRole('link', { name: 'Se déconnecter' }));

          // then
          expect(currentURL()).to.equal('/deconnexion');
        });
      });

      context('when sso account feature toggle is disabled', function () {
        it('should redirect the user to logout url', async function () {
          // given
          const response = new Response(
            200,
            {},
            {
              data: {
                type: 'feature-toggles',
                id: '0',
                attributes: {
                  'is-sso-account-reconciliation-enabled': false,
                },
              },
            }
          );
          server.get('/feature-toggles', () => response);
          const screen = await visit('/connexion/oidc-partner?code=code&state=state');

          // when
          await click(
            screen.getByLabelText("J'accepte les conditions d'utilisation et la politique de confidentialité de Pix")
          );
          await click(screen.getByRole('button', { name: 'Je continue' }));
          await click(screen.getByRole('button', { name: 'Lloyd Consulter mes informations' }));
          await click(screen.getByRole('link', { name: 'Se déconnecter' }));

          // then
          expect(currentURL()).to.equal('/deconnexion');
        });
      });
    });

    context('when user have a pix account', function () {
      it('should redirect user to reconciliation page', async function () {
        // given
        server.create('user', {
          email: 'lloyd.ce@example.net',
          password: 'pix123',
          cgu: true,
          mustValidateTermsOfService: false,
          lastTermsOfServiceValidatedAt: new Date(),
        });

        const response = new Response(
          200,
          {},
          {
            data: {
              type: 'feature-toggles',
              id: '0',
              attributes: {
                'is-sso-account-reconciliation-enabled': true,
              },
            },
          }
        );
        server.get('/feature-toggles', () => response);
        const screen = await visit('/connexion/oidc-partner?code=code&state=state');

        // when
        await fillIn(
          screen.getByRole('textbox', { name: this.intl.t('pages.login-or-register-oidc.login-form.email') }),
          'lloyd.ce@example.net'
        );
        await fillIn(screen.getByLabelText(this.intl.t('pages.login-or-register-oidc.login-form.password')), 'pix123');
        await click(screen.getByRole('button', { name: 'Je me connecte' }));

        // then
        expect(
          screen.getByRole('heading', {
            name: "Attention ! Un nouveau moyen de connexion est sur le point d'être ajouté à votre compte Pix",
          })
        ).to.exist;
      });
    });
  });
});
