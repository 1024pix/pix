import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import Location from 'pix-orga/utils/location';
import { SessionStorageEntry } from 'pix-orga/utils/session-storage-entry';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | OIDC | authentication signup', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  const invitationStorage = new SessionStorageEntry('joinInvitationData');

  hooks.beforeEach(function () {
    sinon.stub(Location, 'assign');
    const organization = server.create('organization', { name: 'Super orga avec SSO' });
    server.create('organizationInvitation', {
      id: '123',
      code: 'ABC',
      status: 'pending',
      organizationId: organization.id,
      organizationName: 'Super orga avec SSO',
    });
    invitationStorage.set({ invitationId: '123', code: 'ABC', organizationName: 'Super orga avec SSO' });
  });

  hooks.afterEach(function () {
    Location.assign.restore();
    invitationStorage.remove();
  });

  test('the user signs up', async function (assert) {
    // when
    const screen = await visit('/connexion/oidc-partner?code=code&state=state');

    // then
    const signUpTitle = await screen.findByRole('heading', { name: t('pages.oidc.signup.title') });
    assert.dom(signUpTitle).exists();

    const invitationText = await screen.findByText(
      t('pages.login.join-invitation', { organizationName: 'Super orga avec SSO' }),
    );
    assert.dom(invitationText).exists();
    const expectedFirstNameLabelAndValue = `${t('pages.oidc.signup.claims.first-name-label')}test`;
    const expectedLastNameLabelAndValue = `${t('pages.oidc.signup.claims.last-name-label')}PIX`;

    const foundFirstNameLabelAndValue = await screen.findByText(
      (_, el) => el.textContent === expectedFirstNameLabelAndValue,
    );
    const foundLastNameLabelAndValue = await screen.findByText(
      (_, el) => el.textContent === expectedLastNameLabelAndValue,
    );

    assert.dom(foundFirstNameLabelAndValue).exists();
    assert.dom(foundLastNameLabelAndValue).exists();

    // when
    await clickByName(t('common.legal-documents.label'));
    const signup = await screen.findByRole('button', { name: t('pages.oidc.signup.signup-button') });
    await click(signup);
    const acceptPixOrgaTermsOfService = await screen.findByRole('button', {
      name: t('components.terms-of-service.actions.accept'),
    });
    await click(acceptPixOrgaTermsOfService);

    // then
    await screen.findByText('Lloyd Cé');
    assert.strictEqual(currentURL(), '/');
    assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
  });

  module('When there are no user claims returned by the identity provider', function () {
    test('displays claim error message', async function (assert) {
      // given
      this.server.post('/oidc/token', () => {
        return new Response(
          401,
          {},
          {
            errors: [
              {
                code: 'SHOULD_VALIDATE_CGU',
                meta: { authenticationKey: 'key', userClaims: null },
              },
            ],
          },
        );
      });

      // when
      const screen = await visit('/connexion/oidc-partner?code=code&state=state');

      // then
      const signUpTitle = await screen.findByRole('heading', { name: t('pages.oidc.signup.title') });
      assert.dom(signUpTitle).exists();

      const claimErrorMessage = await screen.findByText(t('pages.oidc.signup.error.claims'));
      assert.dom(claimErrorMessage).exists();
    });
  });
});
