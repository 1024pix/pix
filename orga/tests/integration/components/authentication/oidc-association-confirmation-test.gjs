import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import OidcAssociationConfirmation from 'pix-orga/components/authentication/oidc-association-confirmation';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Oidc-association-confirmation', function (hooks) {
  setupIntlRenderingTest(hooks);

  const identityProviderSlug = 'new-oidc-partner';
  const identityProviderName = 'Nouveau Partenaire';
  const oidcAuthenticationMethodNames = ['France Connect', 'Impots.gouv'];
  const email = 'lloyidce@example.net';
  const fullNameFromPix = 'Lloyd Pix';
  const fullNameFromExternalIdentityProvider = 'Lloyd Cé';

  test('displays association confirmation page elements', async function (assert) {
    // given
    const onSubmitStub = sinon.stub();

    //  when
    const screen = await render(
      <template>
        <OidcAssociationConfirmation
          @onSubmit={{onSubmitStub}}
          @identityProviderSlug={{identityProviderSlug}}
          @identityProviderName={{identityProviderName}}
          @oidcAuthenticationMethodNames={{oidcAuthenticationMethodNames}}
          @email={{email}}
          @fullNameFromPix={{fullNameFromPix}}
          @fullNameFromExternalIdentityProvider={{fullNameFromExternalIdentityProvider}}
        />
      </template>,
    );

    // then
    assert.ok(
      screen.getByRole('heading', {
        name: `${t('components.authentication.oidc-association-confirmation.title')}`,
      }),
    );
    assert.ok(screen.getByText('Lloyd Cé'));
    assert.ok(screen.getByText('Lloyd Pix'));
    assert.ok(
      screen.getByText(t('components.authentication.oidc-association-confirmation.current-authentication-methods')),
    );
    assert.ok(screen.getByText(t('components.authentication.oidc-association-confirmation.email')));
    assert.ok(screen.getByText('lloyidce@example.net'));
    assert.ok(screen.getByText('France Connect'));
    assert.ok(screen.getByText('Impots.gouv'));

    assert.ok(
      screen.getByText(t('components.authentication.oidc-association-confirmation.authentication-method-to-add')),
    );
    assert.ok(
      screen.getByText(
        `${t('components.authentication.oidc-association-confirmation.external-connection-via')} Nouveau Partenaire`,
      ),
    );

    assert.ok(
      screen.getByRole('button', { name: t('components.authentication.oidc-association-confirmation.return') }),
    );
    assert.ok(
      screen.getByRole('button', { name: t('components.authentication.oidc-association-confirmation.confirm') }),
    );
  });

  test('redirects to /login if user goes back', async function (assert) {
    // given
    const onSubmitStub = sinon.stub();
    const router = this.owner.lookup('service:router');
    sinon.stub(router, 'transitionTo').resolves();

    const screen = await render(
      <template>
        <OidcAssociationConfirmation
          @onSubmit={{onSubmitStub}}
          @identityProviderSlug={{identityProviderSlug}}
          @identityProviderName={{identityProviderName}}
          @oidcAuthenticationMethodNames={{oidcAuthenticationMethodNames}}
          @email={{email}}
          @fullNameFromPix={{fullNameFromPix}}
          @fullNameFromExternalIdentityProvider={{fullNameFromExternalIdentityProvider}}
        />
      </template>,
    );

    // when
    const backButton = await screen.findByRole('button', {
      name: t('components.authentication.oidc-association-confirmation.return'),
    });
    await click(backButton);

    // then
    assert.ok(router.transitionTo.calledWith('authentication.oidc.login', identityProviderSlug));
  });
});
