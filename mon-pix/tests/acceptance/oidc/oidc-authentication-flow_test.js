/* eslint ember/no-classic-classes: 0 */

import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import setupIntl from '../../helpers/setup-intl';
import { expect } from 'chai';

describe('Acceptance | OIDC | authentication flow', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  context('when user is logged in to external provider with logout url and logs out', function () {
    it('should redirect the user to logout url', async function () {
      // given
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
