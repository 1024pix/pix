import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | organizations/information-section', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    this.organization = EmberObject.create({ type: 'SUP', isManagingStudents: false });

    // when
    await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

    // then
    assert.dom('.organization__information').exists();
  });

  test('it should display credit', async function (assert) {
    // given
    const organization = EmberObject.create({ credit: 350 });
    this.set('organization', organization);

    // when
    await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

    // then
    assert.contains('350');
  });

  module('Displaying whether or not the items of this campaign will be exported in results', function () {
    test("it should display 'Oui' when showskills set to true", async function (assert) {
      // given
      const organization = EmberObject.create({ type: 'SUP', showSkills: true });
      this.set('organization', organization);

      // when
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // then
      assert.dom('.organization__showSkills').hasText('Oui');
    });

    test("it should display 'Non' when showskills set to false", async function (assert) {
      // given
      const organization = EmberObject.create({ type: 'SCO', showSkills: false });
      this.set('organization', organization);

      // when
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // then
      assert.dom('.organization__showSkills').hasText('Non');
    });
  });

  test('it should display documentation url', async function (assert) {
    // given
    const organization = EmberObject.create({ documentationUrl: 'https://pix.fr' });
    this.set('organization', organization);

    // when
    await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

    // then
    assert.contains('https://pix.fr');
  });

  test('it should display empty documentation link message', async function (assert) {
    // given
    const organization = EmberObject.create({});
    this.set('organization', organization);

    // when
    await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

    // then
    assert.contains('Non spécifié');
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
    await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

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
        isOrganizationSCO: true,
        isManagingStudents: false,
        credit: 0,
        documentationUrl: 'https://pix.fr/',
        showSkills: false,
      });
      this.set('organization', organization);
    });

    test('it should display edit organization button', async function (assert) {
      // when
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // then
      assert.contains('Editer');
    });

    test('it should toggle edition mode on click to edit button', async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');

      // then
      assert.dom('.organization__edit-form').exists();
    });

    test('it should display organization edit form on click to edit button', async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');

      // then
      assert.dom('input#name').hasValue(organization.name);
      assert.dom('input#externalId').hasValue(organization.externalId);
      assert.dom('input#provinceCode').hasValue(organization.provinceCode);
      assert.dom('input#email').hasValue(organization.email);
      assert.dom('input#credit').hasValue(organization.credit.toString());
      assert.dom('input#isManagingStudents').isNotChecked();
      assert.dom('input#documentationUrl').hasValue(organization.documentationUrl);
      assert.dom('input#showSkills').isNotChecked();
    });

    test("it should show error message if organization's name is empty", async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillIn('#name', '');

      // then
      assert.contains('Le nom ne peut pas être vide');
    });

    test("it should show error message if organization's name is longer than 255 characters", async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillIn('#name', 'a'.repeat(256));

      // then
      assert.contains('La longueur du nom ne doit pas excéder 255 caractères');
    });

    test("it should show error message if organization's external id is longer than 255 characters", async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillIn('#externalId', 'a'.repeat(256));

      // then
      assert.contains("La longueur de l'identifiant externe ne doit pas excéder 255 caractères");
    });

    test("it should show error message if organization's province code is longer than 255 characters", async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillIn('#provinceCode', 'a'.repeat(256));

      // then
      assert.contains('La longueur du département ne doit pas excéder 255 caractères');
    });

    test("it should show error message if organization's email is longer than 255 characters", async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillIn('#email', 'a'.repeat(256));

      // then
      assert.contains("La longueur de l'email ne doit pas excéder 255 caractères.");
    });

    test("it should show error message if organization's email is not valid", async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillIn('#email', 'not-valid-email-format');

      // then
      assert.contains("L'e-mail n'a pas le bon format.");
    });

    test("it should show error message if organization's credit is not valid", async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillIn('#credit', 'credit');

      // then
      assert.contains('Le nombre de crédits doit être un nombre supérieur ou égal à 0.');
    });

    test('it should toggle display mode on click to cancel button', async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);
      await clickByLabel('Editer');

      // when
      await clickByLabel('Annuler');

      // then
      assert.dom('.organization__data').exists();
    });

    test("it should show error message if organization's documentationUrl is not valid", async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByLabel('Editer');
      await fillIn('#documentationUrl', 'not-valid-url-format');

      // then
      assert.contains("Le lien n'est pas valide.");
    });

    test('it should revert changes on click to cancel button', async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      await clickByLabel('Editer');
      await fillIn('input#name', 'new name');
      await fillIn('input#externalId', 'new externalId');
      await fillIn('input#provinceCode', 'new provinceCode');
      await clickByLabel('Gestion d’élèves/étudiants');
      await fillIn('input#documentationUrl', 'new documentationUrl');
      await clickByLabel("Affichage des acquis dans l'export de résultats");

      // when
      await clickByLabel('Annuler');

      // then
      assert.contains(organization.name);
      assert.contains(organization.externalId);
      assert.contains(organization.provinceCode);
      assert.dom('.organization__isManagingStudents').hasText('Non');
      assert.contains(organization.documentationUrl);
      assert.dom('.organization__showSkills').hasText('Non');
    });

    test('it should submit the form if there is no error', async function (assert) {
      // given
      this.set('onSubmit', () => {});
      await render(
        hbs`<Organizations::InformationSection @organization={{this.organization}} @onSubmit={{this.onSubmit}} />`
      );
      await clickByLabel('Editer');

      await fillIn('input#name', 'new name');
      await fillIn('input#externalId', 'new externalId');
      await fillIn('input#provinceCode', '  ');
      await fillIn('input#credit', 50);
      await clickByLabel('Gestion d’élèves/étudiants');
      await fillIn('input#documentationUrl', 'https://pix.fr/');

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.dom('.organization__name').hasText('new name');
      assert.contains('new externalId');
      assert.notContains('Département : ');
      assert.contains('50');
      assert.dom('.organization__isManagingStudents').hasText('Oui');
      assert.contains('https://pix.fr/');
    });
  });

  module('When organization is SCO or SUP', function (hooks) {
    hooks.beforeEach(function () {
      this.organization = EmberObject.create({ type: 'SCO', isOrganizationSCO: true, isManagingStudents: true });
    });

    test('it should display if it is managing students', async function (assert) {
      // when
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // then
      assert.dom('.organization__isManagingStudents').exists();
    });

    test('it should display "Oui" if it is managing students', async function (assert) {
      // given
      this.organization.isManagingStudents = true;

      // when
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      assert.dom('.organization__isManagingStudents').hasText('Oui');
    });

    test('it should display "Non" if managing students is false', async function (assert) {
      // given
      this.organization.isManagingStudents = false;

      // when
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

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
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // then
      assert.dom('.organization__isManagingStudents').doesNotExist();
    });
  });
});
