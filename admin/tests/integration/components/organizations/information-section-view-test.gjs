import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import InformationSectionView from 'pix-admin/components/organizations/information-section-view';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubOidcIdentityProvidersService } from '../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/information-section-view', function (hooks) {
  setupIntlRenderingTest(hooks);

  const toggleEditMode = sinon.stub();
  const toggleArchivingConfirmationModal = sinon.stub();

  module('when user has access', function (hooks) {
    let originalDashboardUrl;

    hooks.beforeEach(function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
      originalDashboardUrl = ENV.APP.ORGANIZATION_DASHBOARD_URL;
    });

    hooks.afterEach(function () {
      ENV.APP.ORGANIZATION_DASHBOARD_URL = originalDashboardUrl;
    });

    test('it renders general information about organization', async function (assert) {
      // given
      stubOidcIdentityProvidersService(this.owner, {
        oidcIdentityProviders: [
          {
            id: 'IDP',
            code: 'IDP',
            application: 'app',
            applicationTld: '.fr',
            organizationName: 'super-sso',
          },
        ],
      });

      const organization = {
        type: 'SUP',
        name: 'SUPer Orga',
        credit: 350,
        documentationUrl: 'https://pix.fr',
        features: {
          SHOW_SKILLS: { active: true },
        },
        createdBy: 1,
        createdAtFormattedDate: '02/09/2022',
        creatorFullName: 'Gilles Parbal',
        identityProviderForCampaigns: 'IDP',
        dataProtectionOfficerFullName: 'Justin Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
        administrationTeamName: 'team Rocket',
        countryCode: 99100,
        countryName: 'France',
        organizationLearnerTypeName: 'super-type-de-prescrit',
      };

      // when
      const screen = await render(
        <template>
          <InformationSectionView
            @organization={{organization}}
            @toggleEditMode={{toggleEditMode}}
            @toggleArchivingConfirmationModal={{toggleArchivingConfirmationModal}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.type')).nextElementSibling)
        .hasText('SUP');
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.dpo-name')).nextElementSibling)
        .hasText('Justin Ptipeu');
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.dpo-email')).nextElementSibling)
        .hasText('justin.ptipeu@example.net');
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.created-by')).nextElementSibling)
        .hasText('Gilles Parbal (1)');
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.created-at')).nextElementSibling)
        .hasText('02/09/2022');

      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.country.label')).nextElementSibling)
        .hasText('France (99100)');

      assert
        .dom(
          screen.getByText(t('components.organizations.information-section-view.administration-team'))
            .nextElementSibling,
        )
        .hasText('team Rocket');
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.credits')).nextElementSibling)
        .hasText('350');
      assert
        .dom(
          screen.getByText(t('components.organizations.information-section-view.documentation-link'))
            .nextElementSibling,
        )
        .hasText('https://pix.fr');
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.sso')).nextElementSibling)
        .hasText('super-sso – app.pix.fr');
      assert
        .dom(
          screen.getByText(t('components.organizations.information-section-view.organization-learner-type'))
            .nextElementSibling,
        )
        .hasText('super-type-de-prescrit');
    });

    test('it renders GAR identity provider correctly', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const oidcPartner = store.createRecord('oidc-identity-provider', {
        code: 'OIDC',
        organizationName: 'a super orga',
        shouldCloseSession: false,
        source: 'idp',
      });
      class OidcIdentityProvidersStub extends Service {
        list = [oidcPartner];
      }
      this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

      const organization = {
        type: 'SUP',
        name: 'SUPer Orga',
        identityProviderForCampaigns: 'GAR',
        tags: [],
        children: [],
      };

      // when
      const screen = await render(
        <template>
          <InformationSectionView
            @organization={{organization}}
            @toggleEditMode={{toggleEditMode}}
            @toggleArchivingConfirmationModal={{toggleArchivingConfirmationModal}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.getByText(t('components.organizations.information-section-view.sso')).nextElementSibling)
        .hasText('GAR');
    });

    module('country information', function () {
      test('it renders Not specified value if no country code', async function (assert) {
        // given
        const organization = {
          name: 'Orga with no country code',
          countryCode: null,
        };

        // when
        const screen = await render(
          <template>
            <InformationSectionView
              @organization={{organization}}
              @toggleEditMode={{toggleEditMode}}
              @toggleArchivingConfirmationModal={{toggleArchivingConfirmationModal}}
            />
          </template>,
        );

        // then
        assert
          .dom(
            screen.getByText(t('components.organizations.information-section-view.country.label')).nextElementSibling,
          )
          .hasText(t('common.not-specified'));
      });

      test('it renders country not found message if no country name', async function (assert) {
        // given
        const organization = {
          name: 'Orga with country code but no country name',
          countryCode: 1234,
          countryName: undefined,
        };

        // when
        const screen = await render(
          <template>
            <InformationSectionView
              @organization={{organization}}
              @toggleEditMode={{toggleEditMode}}
              @toggleArchivingConfirmationModal={{toggleArchivingConfirmationModal}}
            />
          </template>,
        );

        // then
        assert
          .dom(
            screen.getByText(t('components.organizations.information-section-view.country.label')).nextElementSibling,
          )
          .hasText(
            t('components.organizations.information-section-view.country.not-found', {
              countryCode: organization.countryCode,
            }),
          );
      });
    });

    module('data protection officer information', function () {
      test('it renders complete DPO information', async function (assert) {
        // given
        class OidcIdentityProvidersStub extends Service {
          list = [{ organizationName: 'super-sso', code: 'IDP' }];
        }
        this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

        const organization = {
          type: 'SUP',
          name: 'SUPer Orga',
          credit: 350,
          documentationUrl: 'https://pix.fr',
          createdBy: 1,
          createdAtFormattedDate: '02/09/2022',
          creatorFullName: 'Gilles Parbal',
          identityProviderForCampaigns: 'IDP',
          dataProtectionOfficerFullName: 'Justin Ptipeu',
          dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
        };

        // when
        const screen = await render(
          <template>
            <InformationSectionView
              @organization={{organization}}
              @toggleEditMode={{toggleEditMode}}
              @toggleArchivingConfirmationModal={{toggleArchivingConfirmationModal}}
            />
          </template>,
        );

        // then
        assert
          .dom(screen.getByText(t('components.organizations.information-section-view.dpo-name')).nextElementSibling)
          .hasText('Justin Ptipeu');
        assert
          .dom(screen.getByText(t('components.organizations.information-section-view.dpo-email')).nextElementSibling)
          .hasText('justin.ptipeu@example.net');
      });

      test('it renders without DPO information', async function (assert) {
        // given
        class OidcIdentityProvidersStub extends Service {
          list = [{ organizationName: 'super-sso', code: 'IDP' }];
        }
        this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

        const organization = {
          type: 'SUP',
          name: 'SUPer Orga',
          credit: 350,
          documentationUrl: 'https://pix.fr',
          features: { SHOW_SKILLS: { active: true } },
          createdBy: 1,
          createdAtFormattedDate: '02/09/2022',
          creatorFullName: 'Gilles Parbal',
          identityProviderForCampaigns: 'IDP',
          dataProtectionOfficerFullName: '',
          dataProtectionOfficerEmail: '',
        };

        // when
        const screen = await render(
          <template>
            <InformationSectionView
              @organization={{organization}}
              @toggleEditMode={{toggleEditMode}}
              @toggleArchivingConfirmationModal={{toggleArchivingConfirmationModal}}
            />
          </template>,
        );

        // then
        assert
          .dom(screen.getByText(t('components.organizations.information-section-view.dpo-name')).nextElementSibling)
          .hasText('');
        assert
          .dom(screen.getByText(t('components.organizations.information-section-view.dpo-email')).nextElementSibling)
          .hasText('');
      });
    });

    test('it renders edit and archive button', async function (assert) {
      // given
      const organization = EmberObject.create({ type: 'SUP', name: 'SUPer Orga' });

      // when
      const screen = await render(
        <template>
          <InformationSectionView
            @organization={{organization}}
            @toggleEditMode={{toggleEditMode}}
            @toggleArchivingConfirmationModal={{toggleArchivingConfirmationModal}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: t('common.actions.edit') })).exists();
      assert
        .dom(
          screen.getByRole('button', {
            name: t('components.organizations.information-section-view.archive-organization.action'),
          }),
        )
        .exists();
    });

    test('it should display empty documentation link message', async function (assert) {
      // given
      const organization = EmberObject.create({});

      // when
      const screen = await render(
        <template>
          <InformationSectionView
            @organization={{organization}}
            @toggleEditMode={{toggleEditMode}}
            @toggleArchivingConfirmationModal={{toggleArchivingConfirmationModal}}
          />
        </template>,
      );

      // then
      assert
        .dom(
          screen.getByText(t('components.organizations.information-section-view.documentation-link'))
            .nextElementSibling,
        )
        .hasText(t('common.not-specified'));
    });
  });

  module('when user does not have access', function () {
    test('it should not allow to edit or archive an organization', async function (assert) {
      // given
      const organization = EmberObject.create({ name: 'Boba Fett' });

      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(
        <template>
          <InformationSectionView
            @organization={{organization}}
            @toggleEditMode={{toggleEditMode}}
            @toggleArchivingConfirmationModal={{toggleArchivingConfirmationModal}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('button', { name: t('common.actions.edit') })).doesNotExist();
      assert
        .dom(
          screen.queryByRole('button', {
            name: t('components.organizations.information-section-view.archive-organization.action'),
          }),
        )
        .doesNotExist();
    });
  });
});
