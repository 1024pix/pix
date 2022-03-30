import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn } from '@ember/test-helpers';
import { render, clickByName } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | organizations/information-section', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    this.organization = EmberObject.create({ type: 'SUP', isManagingStudents: false });

    // when
    const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

    // then
    assert.dom(screen.queryByText('Archivée le')).doesNotExist();
    assert.dom('.organization__information').exists();
  });

  test('it should display credit', async function (assert) {
    // given
    const organization = EmberObject.create({ credit: 350 });
    this.set('organization', organization);

    // when
    const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

    // then
    assert.dom(screen.getByText('350')).exists();
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
    assert.dom(screen.getByText('Lien vers la documentation : Non spécifié', { exact: false })).exists();
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
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');

      // then
      assert.dom('.organization__edit-form').exists();
    });

    test('it should display organization edit form on click to edit button', async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');

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
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillIn('#name', '');

      // then
      assert.dom(screen.getByText('Le nom ne peut pas être vide')).exists();
    });

    test("it should show error message if organization's name is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillIn('#name', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText('La longueur du nom ne doit pas excéder 255 caractères')).exists();
    });

    test("it should show error message if organization's external id is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillIn('#externalId', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText("La longueur de l'identifiant externe ne doit pas excéder 255 caractères")).exists();
    });

    test("it should show error message if organization's province code is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillIn('#provinceCode', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText('La longueur du département ne doit pas excéder 255 caractères')).exists();
    });

    test("it should show error message if organization's email is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillIn('#email', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText("La longueur de l'email ne doit pas excéder 255 caractères.")).exists();
    });

    test("it should show error message if organization's email is not valid", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillIn('#email', 'not-valid-email-format');

      // then
      assert.dom(screen.getByText("L'e-mail n'a pas le bon format.")).exists();
    });

    test("it should show error message if organization's credit is not valid", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillIn('#credit', 'credit');

      // then
      assert.dom(screen.getByText('Le nombre de crédits doit être un nombre supérieur ou égal à 0.')).exists();
    });

    test('it should toggle display mode on click to cancel button', async function (assert) {
      // given
      await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);
      await clickByName('Éditer');

      // when
      await clickByName('Annuler');

      // then
      assert.dom('.organization__data').exists();
    });

    test("it should show error message if organization's documentationUrl is not valid", async function (assert) {
      // given
      const screen = await render(hbs`<Organizations::InformationSection @organization={{this.organization}} />`);

      // when
      await clickByName('Éditer');
      await fillIn('#documentationUrl', 'not-valid-url-format');

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
      assert.dom(screen.getByText(organization.name)).exists();
      assert.dom(screen.getByText(organization.externalId)).exists();
      assert.dom(screen.getByText(organization.provinceCode)).exists();
      assert.dom('.organization__isManagingStudents').hasText('Non');
      assert.dom(screen.getByText(organization.documentationUrl)).exists();
      assert.dom('.organization__showSkills').hasText('Non');
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
      await fillIn('input#credit', 50);
      await clickByName('Gestion d’élèves/étudiants');
      await fillIn('input#documentationUrl', 'https://pix.fr/');

      // when
      await clickByName('Enregistrer');

      // then
      assert.dom('.organization__name').hasText('new name');
      assert.dom(screen.getByText('new externalId')).exists();
      assert.dom(screen.queryByText('Département : ')).doesNotExist();
      assert.dom(screen.getByText('50')).exists();
      assert.dom('.organization__isManagingStudents').hasText('Oui');
      assert.dom(screen.getByText('https://pix.fr/')).exists();
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
