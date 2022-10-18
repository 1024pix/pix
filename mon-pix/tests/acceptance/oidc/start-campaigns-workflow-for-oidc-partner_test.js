/* eslint ember/no-classic-classes: 0 */

import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';

import { fillIn, currentURL, click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';

import { clickByLabel } from '../../helpers/click-by-label';
import sinon from 'sinon';
import Service from '@ember/service';

import { authenticateByEmail } from '../../helpers/authentication';
import { currentSession } from 'ember-simple-auth/test-support';
import setupIntl from '../../helpers/setup-intl';
import { t } from 'ember-intl/test-support';

describe('Acceptance | Campaigns | Start Campaigns workflow | OIDC', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  let campaign;

  describe('Start a campaign that belongs to an external provider', function () {
    context('When user is not logged in', function () {
      let replaceLocationStub;

      beforeEach(function () {
        replaceLocationStub = sinon.stub().resolves();
        this.owner.register(
          'service:location',
          Service.extend({
            replace: replaceLocationStub,
          })
        );
        campaign = server.create('campaign', { identityProvider: 'OIDC_PARTNER' });
      });

      it('should redirect to landing page', async function () {
        // given
        await visit('/campagnes');

        // when
        await fillIn('#campaign-code', campaign.code);
        await clickByLabel(t('pages.fill-in-campaign-code.start'));

        // then
        expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
      });

      it('should redirect to an oidc authentication form when landing page has been seen', async function () {
        // given
        await visit(`/campagnes/${campaign.code}`);

        // when
        await clickByLabel('Je commence');

        // then
        sinon.assert.called(replaceLocationStub);
        expect(currentURL()).to.equal('/connexion/oidc-partner');
      });

      it('should redirect to login or register oidc page', async function () {
        // given
        const state = 'state';
        const session = currentSession();
        session.set('data.state', state);
        this.server.post('oidc/token', () => {
          return new Response(
            401,
            {},
            {
              errors: [
                {
                  code: 'SHOULD_VALIDATE_CGU',
                  meta: {
                    authenticationKey: 'key',
                  },
                },
              ],
            }
          );
        });

        // when
        const screen = await visit(`/connexion/oidc-partner?code=test&state=${state}`);

        // then
        expect(currentURL()).to.equal(`/connexion/oidc?authenticationKey=key&identityProviderSlug=oidc-partner`);
        expect(screen.getByRole('heading', { name: this.intl.t('pages.login-or-register-oidc.title') })).to.exist;
      });

      it('should begin campaign participation once user has accepted terms of service', async function () {
        // given
        const state = 'state';
        const session = currentSession();
        session.set('data.state', state);
        session.set('data.nextURL', `/campagnes/${campaign.code}/acces`);
        const data = {};
        data[campaign.code] = { landingPageShown: true };
        sessionStorage.setItem('campaigns', JSON.stringify(data));

        // when
        const screen = await visit(`/connexion/oidc?authenticationKey=key&identityProviderSlug=oidc-partner`);
        await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));
        await click(screen.getByRole('button', { name: 'Je créé mon compte' }));

        // then
        expect(currentURL()).to.equal(`/campagnes/${campaign.code}/evaluation/didacticiel`);
      });
    });

    context('When user is logged in', function () {
      let replaceLocationStub;

      beforeEach(async function () {
        const prescritUser = server.create('user', 'withEmail', {
          mustValidateTermsOfService: false,
          lastTermsOfServiceValidatedAt: null,
        });
        await authenticateByEmail(prescritUser);
        replaceLocationStub = sinon.stub().resolves();
        this.owner.register(
          'service:location',
          Service.extend({
            replace: replaceLocationStub,
          })
        );
        campaign = server.create('campaign', { identityProvider: 'OIDC_PARTNER' });
      });

      context('When user is logged in with an oidc organization', function () {
        beforeEach(function () {
          const session = currentSession();
          session.set('data.authenticated.identityProviderCode', 'OIDC_PARTNER');
        });

        it('should redirect to landing page', async function () {
          // given
          await visit('/campagnes');

          // when
          await fillIn('#campaign-code', campaign.code);
          await clickByLabel(t('pages.fill-in-campaign-code.start'));

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
        });

        it('should begin campaign participation', async function () {
          // given
          await visit('/campagnes');
          await fillIn('#campaign-code', campaign.code);
          await clickByLabel(t('pages.fill-in-campaign-code.start'));

          // when
          await clickByLabel('Je commence');

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/evaluation/didacticiel`);
        });
      });

      context('When user is logged in with another authentication method', function () {
        it('should redirect to landing page', async function () {
          // given
          await visit('/campagnes');

          // when
          await fillIn('#campaign-code', campaign.code);
          await clickByLabel(t('pages.fill-in-campaign-code.start'));

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
        });

        it('should redirect to oidc authentication form when landing page has been seen', async function () {
          // given
          await visit(`/campagnes/${campaign.code}`);

          // when
          await clickByLabel('Je commence');

          // then
          sinon.assert.called(replaceLocationStub);
          expect(currentURL()).to.equal('/connexion/oidc-partner');
        });
      });
    });
  });
});
