import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render as renderScreen, fillInByLabel, clickByLabel } from '../../helpers/testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | organization-information-section', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    this.organization = EmberObject.create({ type: 'SUP', isManagingStudents: false });

    // when
    await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

    // then
    assert.dom('.organization__information').exists();
  });

  test('it should display credit', async function (assert) {
    // given
    const organization = EmberObject.create({ credit: 350 });
    this.set('organization', organization);

    // when
    await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

    // then
    assert.contains('350');
  });

  test('it should display canCollectProfiles', async function (assert) {
    // given
    const organization = EmberObject.create({ canCollectProfiles: true });
    this.set('organization', organization);

    // when
    await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

    // then
    assert.dom('.organization__canCollectProfiles').hasText('Oui');
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
    await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

    // expect
    assert.contains('CFA');
    assert.contains('PRIVE');
    assert.contains('AGRICULTURE');
  });

  module('Edit organization', function (hooks) {
    let organization;

    hooks.beforeEach(function () {
      organization = EmberObject.create({
        id: 1,
        name: 'Organization SCO',
        externalId: 'VELIT',
        provinceCode: 'h50',
        email: 'sco.generic.account@example.net',
        canCollectProfiles: false,
        isOrganizationSCO: true,
        isManagingStudents: false,
        credit: 0,
      });
      this.set('organization', organization);
    });

    test('it should display edit organization button', async function (assert) {
      // when
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // then
      assert.dom("button[aria-label='Editer']").exists();
    });

    test('it should toggle edition mode on click to edit button', async function (assert) {
      // given
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');

      // then
      assert.dom('.organization__edit-form').exists();
    });

    test('it should display organization edit form on click to edit button', async function (assert) {
      // given
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');

      // then
      assert.dom('input#name').hasValue(organization.name);
      assert.dom('input#externalId').hasValue(organization.externalId);
      assert.dom('input#provinceCode').hasValue(organization.provinceCode);
      assert.dom('input#email').hasValue(organization.email);
      assert.dom('input#credit').hasValue(organization.credit.toString());
      assert.dom('input#canCollectProfiles').isNotChecked();
      assert.dom('input#isManagingStudents').isNotChecked();
    });

    test("it should show error message if organization's name is empty", async function (assert) {
      // given
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillInByLabel('* Nom', '');

      // then
      assert.contains('Le nom ne peut pas être vide');
    });

    test("it should show error message if organization's name is longer than 255 characters", async function (assert) {
      // given
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillInByLabel('* Nom', 'a'.repeat(256));

      // then
      assert.contains('La longueur du nom ne doit pas excéder 255 caractères');
    });

    test("it should show error message if organization's external id is longer than 255 characters", async function (assert) {
      // given
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillInByLabel('Identifiant externe', 'a'.repeat(256));

      // then
      assert.contains("La longueur de l'identifiant externe ne doit pas excéder 255 caractères");
    });

    test("it should show error message if organization's province code is longer than 255 characters", async function (assert) {
      // given
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillInByLabel('Département (en 3 chiffres)', 'a'.repeat(256));

      // then
      assert.contains('La longueur du département ne doit pas excéder 255 caractères');
    });

    test("it should show error message if organization's email is longer than 255 characters", async function (assert) {
      // given
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillInByLabel('Adresse e-mail (SCO)', 'a'.repeat(256));

      // then
      assert.contains("La longueur de l'email ne doit pas excéder 255 caractères.");
    });

    test("it should show error message if organization's email is not valid", async function (assert) {
      // given
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillInByLabel('Adresse e-mail (SCO)', 'not-valid-email-format');

      // then
      assert.contains("L'e-mail n'a pas le bon format.");
    });

    test("it should show error message if organization's credit is not valid", async function (assert) {
      // given
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillInByLabel('Crédits', 'credits');

      // then
      assert.contains('Le nombre de crédits doit être un nombre supérieur ou égal à 0.');
    });

    test('it should toggle display mode on click to cancel button', async function (assert) {
      // given
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);
      await clickByLabel('Editer');

      // when
      await clickByLabel('Annuler');

      // then
      assert.dom('.organization__data').exists();
    });

    test('it should revert changes on click to cancel button', async function (assert) {
      // given
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      await clickByLabel('Editer');
      await fillInByLabel('* Nom', 'new name');
      await fillInByLabel('Identifiant externe', 'new external id');
      await fillInByLabel('Département (en 3 chiffres)', 'new provinceCode');
      await clickByLabel('Gestion d’élèves/étudiants');
      await clickByLabel('Collecte de profils');

      // when
      await clickByLabel('Annuler');

      // then
      assert.contains(organization.name);
      assert.contains(organization.externalId);
      assert.contains(organization.provinceCode);
      assert.dom('.organization__isManagingStudents').hasText('Non');
      assert.dom('.organization__canCollectProfiles').hasText('Non');
    });

    test('it should submit the form if there is no error', async function (assert) {
      // given
      this.set('onSubmit', () => {});
      await renderScreen(
        hbs`<OrganizationInformationSection @organization={{this.organization}} @onSubmit={{this.onSubmit}} />`
      );
      await clickByLabel('Editer');

      await fillInByLabel('* Nom', 'new name');
      await fillInByLabel('Identifiant externe', 'new externalId');
      await fillInByLabel('Département (en 3 chiffres)', '  ');
      await fillInByLabel('Crédits', 50);
      await clickByLabel('Gestion d’élèves/étudiants');
      await clickByLabel('Collecte de profils');

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.dom('.organization__name').hasText('new name');
      assert.contains('new externalId');
      assert.notContains('Département : ');
      assert.contains('50');
      assert.dom('.organization__canCollectProfiles').hasText('Oui');
      assert.dom('.organization__isManagingStudents').hasText('Oui');
    });
  });

  module('When organization is SCO or SUP', function (hooks) {
    hooks.beforeEach(function () {
      this.organization = EmberObject.create({ type: 'SCO', isOrganizationSCO: true, isManagingStudents: true });
    });

    test('it should display if it is managing students', async function (assert) {
      // when
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // then
      assert.dom('.organization__isManagingStudents').exists();
    });

    test('it should display "Oui" if it is managing students', async function (assert) {
      // given
      this.organization.isManagingStudents = true;

      // when
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      assert.dom('.organization__isManagingStudents').hasText('Oui');
    });

    test('it should display "Non" if managing students is false', async function (assert) {
      // given
      this.organization.isManagingStudents = false;

      // when
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // then
      assert.dom('.organization__isManagingStudents').hasText('Non');
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
      await renderScreen(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // then
      assert.dom('.organization__isManagingStudents').doesNotExist();
    });
  });
});
