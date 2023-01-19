import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click } from '@ember/test-helpers';
import { render, clickByName, fillByLabel } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | organizations/information-section', function (hooks) {
  setupRenderingTest(hooks);

  module('when editing organization', function (hooks) {
    let organization;

    hooks.beforeEach(function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);

      organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        isOrganizationSCO: true,
        isManagingStudents: false,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        showSkills: false,
      });
      this.set('organization', organization);
    });

    test('it should toggle edition mode on click to edit button', async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Nom' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Identifiant externe' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
    });

    test('it should toggle display mode on click to cancel button', async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);
      await clickByName('Éditer');

      // when
      await clickByName('Annuler');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Organization SCO' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Éditer' })).exists();
      assert.dom(screen.getByRole('button', { name: "Archiver l'organisation" })).exists();
    });

    test('it should revert changes on click to cancel button', async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      await clickByName('Éditer');

      await fillByLabel('* Nom', 'new name');
      await fillByLabel('Identifiant externe', 'new externalId');
      await fillByLabel('Département (en 3 chiffres)', 'new provinceCode');
      await clickByName('Gestion d’élèves/étudiants');
      await fillByLabel('Lien vers la documentation', 'new documentationUrl');
      await clickByName("Affichage des acquis dans l'export de résultats");

      // when
      await clickByName('Annuler');

      // then
      assert.dom(screen.getByRole('heading', { name: organization.name })).exists();
      assert.dom(screen.getByText(`Identifiant externe : ${organization.externalId}`)).exists();
      assert.dom(screen.getByText(`Département : ${organization.provinceCode}`)).exists();
      assert.dom(screen.getByRole('link', { name: organization.documentationUrl })).exists();
      assert.dom(screen.getByText(`Gestion d’élèves/étudiants : Non`)).exists();
      assert.dom(screen.getByText("Affichage des acquis dans l'export de résultats : Non")).exists();
    });

    test('it should submit the form if there is no error', async function (assert) {
      // given
      this.set('onSubmit', () => {});
      const store = this.owner.lookup('service:store');
      const oidcIdentityProvider1 = store.createRecord('oidc-identity-provider', {
        code: 'OIDC-1',
        organizationName: 'organization 1',
        hasLogoutUrl: false,
        source: 'source1',
      });
      const oidcIdentityProvider2 = store.createRecord('oidc-identity-provider', {
        code: 'OIDC-2',
        organizationName: 'organization 2',
        hasLogoutUrl: false,
        source: 'source2',
      });
      class OidcIdentittyProvidersStub extends Service {
        list = [oidcIdentityProvider1, oidcIdentityProvider2];
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentittyProvidersStub);

      const screen = await render(
        hbs`<Organizations::InformationSection @organization={{this.organization}} @onSubmit={{this.onSubmit}} />`
      );
      await clickByName('Éditer');

      await fillByLabel('* Nom', 'new name');
      await fillByLabel('Identifiant externe', 'new externalId');
      await fillByLabel('Département (en 3 chiffres)', '   ');
      await fillByLabel('Crédits', 50);
      await clickByName('Gestion d’élèves/étudiants');
      await fillByLabel('Lien vers la documentation', 'https://pix.fr/');
      await clickByName('SSO');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'organization 2' }));

      // when
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByRole('heading', { name: 'new name' })).exists();
      assert.dom(screen.getByText('Identifiant externe : new externalId')).exists();
      assert.dom(screen.queryByText('Département : ')).doesNotExist();
      assert.dom(screen.getByText('Crédits : 50')).exists();
      assert.dom(screen.getByText('Gestion d’élèves/étudiants : Oui')).exists();
      assert.dom(screen.getByRole('link', { name: 'https://pix.fr/' })).exists();
      assert.dom(screen.getByText('SSO : organization 2')).exists();
    });
  });
});
