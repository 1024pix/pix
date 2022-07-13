/* eslint ember/no-classic-classes: 0 */

import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, visit } from '@ember/test-helpers';
import Service from '@ember/service';
import sinon from 'sinon';
import setupIntl from '../../helpers/setup-intl';
import { clickByLabel } from '../../helpers/click-by-label';

describe('Acceptance | Pôle Emploi | authentication flow', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  context('when user is logged in', function () {
    context('on log out', function () {
      it('should redirect to logout url', async function () {
        // given
        await visit('/connexion-pole-emploi?code=code&state=state');
        const replaceLocationStub = sinon.stub().resolves();
        this.owner.register(
          'service:location',
          Service.extend({
            replace: replaceLocationStub,
          })
        );

        // when
        await click('#pix-cgu');
        await clickByLabel(this.intl.t('pages.terms-of-service-pole-emploi.form.button'));
        await clickByLabel('Paul');
        await clickByLabel(this.intl.t('navigation.user.sign-out'));

        // then
        sinon.assert.calledWith(
          replaceLocationStub,
          'http://identity_provider_base_url/deconnexion?id_token_hint=ID_TOKEN&redirect_uri=http%3A%2F%2Flocalhost.fr%3A4200%2Fconnexion'
        );
      });
    });
  });
});
