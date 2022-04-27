import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn } from '@ember/test-helpers';
import { render, clickByName, fillByLabel } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | organizations/information-section', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    this.organization = EmberObject.create({ type: 'SUP', isManagingStudents: false, name: 'SUPer Orga' });

    // when
    const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

    // then
    assert.dom(screen.queryByText('Archivée le')).doesNotExist();
    assert.dom(screen.getByRole('heading', { name: 'SUPer Orga' })).exists();
    assert.dom(screen.getByText('Type : SUP')).exists();
    assert.dom(screen.getByRole('button', { name: 'Éditer' })).exists();
    assert.dom(screen.getByRole('button', { name: "Archiver l'organisation" })).exists();
  });

  test('it should display credit', async function (assert) {
    // given
    const organization = EmberObject.create({ credit: 350 });
    this.set('organization', organization);

    // when
    const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

    // then
    assert.dom(screen.getByText('Crédits : 350')).exists();
  });

  module('Displaying whether or not the items of this campaign will be exported in results', function () {
    test("it should display 'Oui' when showskills set to true", async function (assert) {
      // given
      const organization = EmberObject.create({ type: 'SUP', showSkills: true });
      this.set('organization', organization);

      // when
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // then
      assert.dom(screen.getByText("Affichage des acquis dans l'export de résultats : Oui")).exists();
    });

    test("it should display 'Non' when showskills set to false", async function (assert) {
      // given
      const organization = EmberObject.create({ type: 'SCO', showSkills: false });
      this.set('organization', organization);

      // when
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // then
      assert.dom(screen.getByText("Affichage des acquis dans l'export de résultats : Non")).exists();
    });
  });

  test('it should display documentation url', async function (assert) {
    // given
    const organization = EmberObject.create({ documentationUrl: 'https://pix.fr' });
    this.set('organization', organization);

    // when
    const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

    // then
    assert.dom(screen.getByText('https://pix.fr')).exists();
  });

  test('it should display empty documentation link message', async function (assert) {
    // given
    const organization = EmberObject.create({});
    this.set('organization', organization);

    // when
    const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

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
    const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

    // expect
    assert.dom(screen.getByText('CFA')).exists();
    assert.dom(screen.getByText('PRIVE')).exists();
    assert.dom(screen.getByText('AGRICULTURE')).exists();
  });

  module('when organization is archived', function () {
    test('it should display who archived it', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const archivedAt = new Date('2022-02-22');
      const organization = store.createRecord('organization', { archivistFullName: 'Rob Lochon', archivedAt });
      this.set('organization', organization);

      // when
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // expect
      assert.dom(screen.getByText('Archivée le 22/02/2022 par Rob Lochon.')).exists();
    });
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
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // then
      assert.dom(screen.getByRole('button', { name: 'Éditer' })).exists();
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

    test('it should display organization edit form on click to edit button', async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Nom' })).hasValue(organization.name);
      assert.dom(screen.getByRole('textbox', { name: 'Identifiant externe' })).hasValue(organization.externalId);
      assert
        .dom(screen.getByRole('textbox', { name: 'Département (en 3 chiffres)' }))
        .hasValue(organization.provinceCode);
      assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail (SCO)' })).hasValue(organization.email);
      assert.dom(screen.getByRole('spinbutton', { name: 'Crédits' })).hasValue(organization.credit.toString());
      assert.dom(screen.getByRole('checkbox', { name: 'Gestion d’élèves/étudiants' })).isNotChecked();
      assert
        .dom(screen.getByRole('textbox', { name: 'Lien vers la documentation' }))
        .hasValue(organization.documentationUrl);
      assert
        .dom(screen.getByRole('checkbox', { name: "Affichage des acquis dans l'export de résultats" }))
        .isNotChecked();
    });

    test("it should show error message if organization's name is empty", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillByLabel('* Nom', '');

      // then
      assert.dom(screen.getByText('Le nom ne peut pas être vide')).exists();
    });

    test("it should show error message if organization's name is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillByLabel('* Nom', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText('La longueur du nom ne doit pas excéder 255 caractères')).exists();
    });

    test("it should show error message if organization's external id is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillByLabel('Identifiant externe', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText("La longueur de l'identifiant externe ne doit pas excéder 255 caractères")).exists();
    });

    test("it should show error message if organization's province code is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillByLabel('Département (en 3 chiffres)', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText('La longueur du département ne doit pas excéder 255 caractères')).exists();
    });

    test("it should show error message if organization's email is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillByLabel('Adresse e-mail (SCO)', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText("La longueur de l'email ne doit pas excéder 255 caractères.")).exists();
    });

    test("it should show error message if organization's email is not valid", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillByLabel('Adresse e-mail (SCO)', 'not-valid-email-format');

      // then
      assert.dom(screen.getByText("L'e-mail n'a pas le bon format.")).exists();
    });

    test("it should show error message if organization's credit is not valid", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillByLabel('Crédits', 'credit');

      // then
      assert.dom(screen.getByText('Le nombre de crédits doit être un nombre supérieur ou égal à 0.')).exists();
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

    test("it should show error message if organization's documentationUrl is not valid", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillByLabel('Lien vers la documentation', 'not-valid-url-format');

      // then
      assert.dom(screen.getByText("Le lien n'est pas valide.")).exists();
    });

    test('it should revert changes on click to cancel button', async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      await clickByName('Éditer');
      await fillIn('input#name', 'new name');
      await fillIn('input#externalId', 'new externalId');
      await fillIn('input#provinceCode', 'new provinceCode');
      await clickByName('Gestion d’élèves/étudiants');
      await fillIn('input#documentationUrl', 'new documentationUrl');
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
      const screen = await render(
        hbs`<Organizations::InformationSection @organization={{this.organization}} @onSubmit={{this.onSubmit}} />`
      );
      await clickByName('Éditer');

      await fillIn('input#name', 'new name');
      await fillIn('input#externalId', 'new externalId');
      await fillIn('input#provinceCode', '  ');
      await fillIn('input#credits', 50);
      await clickByName('Gestion d’élèves/étudiants');
      await fillIn('input#documentationUrl', 'https://pix.fr/');

      // when
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.getByRole('heading', { name: 'new name' })).exists();
      assert.dom(screen.getByText('Identifiant externe : new externalId')).exists();
      assert.dom(screen.queryByText('Département : ')).doesNotExist();
      assert.dom(screen.getByText('Crédits : 50')).exists();
      assert.dom(screen.getByText(`Gestion d’élèves/étudiants : Oui`)).exists();
      assert.dom(screen.getByRole('link', { name: 'https://pix.fr/' })).exists();
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
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      assert.dom(screen.getByText(`Gestion d’élèves/étudiants : Oui`)).exists();
    });

    test('it should display "Non" if managing students is false', async function (assert) {
      // given
      this.organization.isManagingStudents = false;

      // when
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

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
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // then
      assert.dom(screen.queryByRole('checkbox', { name: 'Gestion d’élèves/étudiants' })).doesNotExist();
    });
  });
});
