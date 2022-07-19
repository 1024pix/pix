/* eslint ember/no-classic-classes: 0 */

import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import sinon from 'sinon';
import setupIntl from '../../helpers/setup-intl';

describe('Acceptance | Pôle Emploi | authentication flow', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  context('when user is logged in with Pole Emploi and logs out', function () {
    it('should redirect the user to logout url', async function () {
      // given
      const screen = await visit('/connexion-pole-emploi?code=code&state=state');
      const replaceLocationStub = sinon.stub().resolves();
      this.owner.register(
        'service:location',
        Service.extend({
          replace: replaceLocationStub,
        })
      );

      // when
      await click(
        screen.getByLabelText("J'accepte les conditions d'utilisation et la politique de confidentialité de Pix")
      );
      await click(screen.getByRole('button', { name: 'Je continue' }));
      await click(screen.getByRole('button', { name: 'Paul Consulter mes informations' }));
      await click(screen.getByRole('link', { name: 'Se déconnecter' }));

      // then
      sinon.assert.calledWith(
        replaceLocationStub,
        'http://identity_provider_base_url/deconnexion?id_token_hint=ID_TOKEN&redirect_uri=http%3A%2F%2Flocalhost.fr%3A4200%2Fconnexion'
      );
    });
  });
});
