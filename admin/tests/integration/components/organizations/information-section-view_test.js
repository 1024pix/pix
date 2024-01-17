import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | organizations/information-section-view', function (hooks) {
  setupRenderingTest(hooks);

  module('when user has access', function (hooks) {
    hooks.beforeEach(function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
    });

    test('it renders general information about organization', async function (assert) {
      // given
      class OidcIdentityProvidersStub extends Service {
        list = [{ organizationName: 'super-sso', code: 'IDP' }];
      }
      this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

      this.set('organization', {
        type: 'SUP',
        isManagingStudents: false,
        name: 'SUPer Orga',
        credit: 350,
        documentationUrl: 'https://pix.fr',
        showSkills: true,
        createdBy: 1,
        createdAtFormattedDate: '02/09/2022',
        creatorFullName: 'Gilles Parbal',
        identityProviderForCampaigns: 'IDP',
        dataProtectionOfficerFullName: 'Justin Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
      });

      // when
      const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

      // then
      assert.dom(screen.getByRole('heading', { name: 'SUPer Orga' })).exists();
      assert.dom(screen.getByText('Type : SUP')).exists();
      assert.dom(screen.getByText('Nom du DPO : Justin Ptipeu')).exists();
      assert.dom(screen.getByText('Adresse e-mail du DPO : justin.ptipeu@example.net')).exists();
      assert.dom(screen.getByText('Créée par : Gilles Parbal (1)')).exists();
      assert.dom(screen.getByText('Créée le : 02/09/2022')).exists();
      assert.dom(screen.getByText("Affichage des acquis dans l'export de résultats : Oui")).exists();
      assert.dom(screen.getByText('Crédits : 350')).exists();
      assert.dom(screen.getByText('https://pix.fr')).exists();
      assert.dom(screen.getByText('SSO : super-sso')).exists();
    });

    module('data protection officer information', function () {
      test('it renders complete DPO information', async function (assert) {
        // given
        class OidcIdentityProvidersStub extends Service {
          list = [{ organizationName: 'super-sso', code: 'IDP' }];
        }
        this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

        this.set('organization', {
          type: 'SUP',
          isManagingStudents: false,
          name: 'SUPer Orga',
          credit: 350,
          documentationUrl: 'https://pix.fr',
          showSkills: true,
          createdBy: 1,
          createdAtFormattedDate: '02/09/2022',
          creatorFullName: 'Gilles Parbal',
          identityProviderForCampaigns: 'IDP',
          dataProtectionOfficerFullName: 'Justin Ptipeu',
          dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
        });

        // when
        const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

        // then
        assert.dom(screen.getByText('Nom du DPO : Justin Ptipeu')).exists();
        assert.dom(screen.getByText('Adresse e-mail du DPO : justin.ptipeu@example.net')).exists();
      });

      test('it renders partial DPO information', async function (assert) {
        // given
        class OidcIdentityProvidersStub extends Service {
          list = [{ organizationName: 'super-sso', code: 'IDP' }];
        }
        this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

        this.set('organization', {
          type: 'SUP',
          isManagingStudents: false,
          name: 'SUPer Orga',
          credit: 350,
          documentationUrl: 'https://pix.fr',
          showSkills: true,
          createdBy: 1,
          createdAtFormattedDate: '02/09/2022',
          creatorFullName: 'Gilles Parbal',
          identityProviderForCampaigns: 'IDP',
          dataProtectionOfficerFullName: 'Ptipeu',
          dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
        });

        // when
        const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

        // then
        assert.dom(screen.getByText('Nom du DPO : Ptipeu')).exists();
        assert.dom(screen.getByText('Adresse e-mail du DPO : justin.ptipeu@example.net')).exists();
      });

      test('it renders without DPO information', async function (assert) {
        // given
        class OidcIdentityProvidersStub extends Service {
          list = [{ organizationName: 'super-sso', code: 'IDP' }];
        }
        this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);

        this.set('organization', {
          type: 'SUP',
          isManagingStudents: false,
          name: 'SUPer Orga',
          credit: 350,
          documentationUrl: 'https://pix.fr',
          showSkills: true,
          createdBy: 1,
          createdAtFormattedDate: '02/09/2022',
          creatorFullName: 'Gilles Parbal',
          identityProviderForCampaigns: 'IDP',
          dataProtectionOfficerFullName: '',
          dataProtectionOfficerEmail: '',
        });

        // when
        const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

        // then
        assert.dom(screen.getByText('Nom du DPO :')).exists();
        assert.dom(screen.getByText('Adresse e-mail du DPO :')).exists();
      });
    });

    test('it renders edit and archive button', async function (assert) {
      // given
      this.organization = EmberObject.create({ type: 'SUP', isManagingStudents: false, name: 'SUPer Orga' });

      // when
      const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

      // then
      assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
      assert.dom(screen.getByRole('button', { name: "Archiver l'organisation" })).exists();
    });

    test('it should display empty documentation link message', async function (assert) {
      // given
      const organization = EmberObject.create({});
      this.set('organization', organization);

      // when
      const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

      // then
      assert.dom(screen.getByText('Lien vers la documentation : Non spécifié')).exists();
    });

    test('it should display tags', async function (assert) {
      // given
      const organization = EmberObject.create({
        tags: [
          { id: 1, name: 'CFA' },
          { id: 2, name: 'PRIVE' },
          { id: 3, name: 'AGRICULTURE' },
        ],
      });
      this.set('organization', organization);

      // when
      const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

      // then
      assert.dom(screen.getByText('CFA')).exists();
      assert.dom(screen.getByText('PRIVE')).exists();
      assert.dom(screen.getByText('AGRICULTURE')).exists();
    });

    module('when organization has no tags', function () {
      test('it should display an informative message', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const organization = store.createRecord('organization', {
          archivedAt: null,
          tags: [],
        });
        this.set('organization', organization);

        // when
        const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

        // then
        assert.dom(screen.getByText("Cette organisation n'a pas de tags.")).exists();
      });
    });

    module('when organization is archived', function () {
      test('it should display who archived it', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const archivedAt = new Date('2022-02-22');
        const organization = store.createRecord('organization', { archivistFullName: 'Rob Lochon', archivedAt });
        this.set('organization', organization);

        // when
        const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

        // then
        assert.dom(screen.getByText('Archivée le 22/02/2022 par Rob Lochon.')).exists();
      });
    });

    module('When organization is SCO or SUP', function (hooks) {
      hooks.beforeEach(function () {
        this.organization = EmberObject.create({ type: 'SCO', isOrganizationSCO: true, isManagingStudents: true });
      });

      test('it should display "Oui" if it is managing students', async function (assert) {
        // given
        this.organization.isManagingStudents = true;

        // when
        const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

        assert.dom(screen.getByText(`Gestion d’élèves/étudiants : Oui`)).exists();
      });

      test('it should display "Non" if managing students is false', async function (assert) {
        // given
        this.organization.isManagingStudents = false;

        // when
        const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

        // then
        assert.dom(screen.getByText(`Gestion d’élèves/étudiants : Non`)).exists();
      });
    });

    module('When organization is not SCO', function (hooks) {
      hooks.beforeEach(function () {
        this.organization = EmberObject.create({ type: 'PRO', isOrganizationSCO: false, isOrganizationSUP: false });
      });

      test('it should not display if it is managing students', async function (assert) {
        // given
        this.organization.isManagingStudents = false;

        // when
        const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

        // then
        assert.dom(screen.queryByRole('checkbox', { name: 'Gestion d’élèves/étudiants' })).doesNotExist();
      });
    });
  });

  module('when user does not have access', function () {
    test('it should not allow to edit or archive an organization', async function (assert) {
      // given
      const organization = EmberObject.create({ name: 'Boba Fett' });
      this.set('organization', organization);
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(hbs`<Organizations::InformationSectionView @organization={{this.organization}} />`);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Modifier' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: "Archiver l'organisation" })).doesNotExist();
    });
  });
});
