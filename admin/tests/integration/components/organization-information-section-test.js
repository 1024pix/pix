import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | organization-information-section', function(hooks) {

  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    this.organization = EmberObject.create({ type: 'SUP', isManagingStudents: false });

    // when
    await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

    // then
    assert.dom('.organization__information').exists();
  });

  test('it should display credit', async function(assert) {
    // given
    const organization = EmberObject.create({ credit: 350 });
    this.set('organization', organization);

    // when
    await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

    // then
    assert.dom('.organization__credit').hasText('350');
  });

  test('it should display canCollectProfiles', async function(assert) {
    // given
    const organization = EmberObject.create({ canCollectProfiles: true });
    this.set('organization', organization);

    // when
    await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

    // then
    assert.dom('.organization__canCollectProfiles').hasText('Oui');
  });

  module('Edit organization', function(hooks) {

    let organization;

    hooks.beforeEach(function() {
      organization = EmberObject.create({ id: 1, name: 'Organization SCO', externalId: 'VELIT', provinceCode: 'h50', email: 'sco.generic.account@example.net' });
      this.set('organization', organization);
    });

    test('it should display edit organization button', async function(assert) {
      // when
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // then
      assert.dom('button[aria-label=\'Editer\'').exists();
    });

    test('it should toggle edition mode on click to edit button', async function(assert) {
      // given
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await click('button[aria-label=\'Editer\'');

      // then
      assert.dom('.organization__edit-form').exists();
    });

    test('it should display organization edit form on click to edit button', async function(assert) {
      // given
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await click('button[aria-label=\'Editer\'');

      // then
      assert.dom('input#name').hasValue(organization.name);
      assert.dom('input#externalId').hasValue(organization.externalId);
      assert.dom('input#provinceCode').hasValue(organization.provinceCode);
      assert.dom('input#email').hasValue(organization.email);
    });

    test('it should show error message if organization\'s name is empty', async function(assert) {
      // given
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await click('button[aria-label=\'Editer\'');
      await fillIn('#name', '');

      // then
      assert.dom('div[aria-label="Message d\'erreur du champ nom"]').hasText('Le nom ne peut pas être vide');
    });

    test('it should show error message if organization\'s name is longer than 255 characters', async function(assert) {
      // given
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await click('button[aria-label=\'Editer\'');
      await fillIn('#name', 'a'.repeat(256));

      // then
      assert.dom('div[aria-label="Message d\'erreur du champ nom"]').hasText('La longueur du nom ne doit pas excéder 255 caractères');
    });

    test('it should show error message if organization\'s external id is longer than 255 characters', async function(assert) {
      // given
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await click('button[aria-label=\'Editer\'');
      await fillIn('#externalId', 'a'.repeat(256));

      // then
      assert.dom('div[aria-label="Message d\'erreur du champ identifiant externe"]').hasText('La longueur de l\'identifiant externe ne doit pas excéder 255 caractères');
    });

    test('it should show error message if organization\'s province code is longer than 255 characters', async function(assert) {
      // given
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await click('button[aria-label=\'Editer\'');
      await fillIn('#provinceCode', 'a'.repeat(256));

      // then
      assert.dom('div[aria-label="Message d\'erreur du champ département"]').hasText('La longueur du département ne doit pas excéder 255 caractères');
    });

    test('it should show error message if organization\'s email is longer than 255 characters', async function(assert) {
      // given
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await click('button[aria-label=\'Editer\'');
      await fillIn('#email', 'a'.repeat(256));

      // then
      assert.dom('div[aria-label="Message d\'erreur du champ adresse email"]').hasText('La longueur de l\'email ne doit pas excéder 255 caractères.');
    });

    test('it should show error message if organization\'s email is not valid', async function(assert) {
      // given
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // when
      await click('button[aria-label=\'Editer\'');
      await fillIn('#email', 'not-valid-email-format');

      // then
      assert.dom('div[aria-label="Message d\'erreur du champ adresse email"]').hasText('L\'e-mail n\'a pas le bon format.');
    });

    test('it should toggle display mode on click to cancel button', async function(assert) {
      // given
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);
      await click('button[aria-label=\'Editer\'');

      // when
      await click('button[aria-label=\'Annuler\'');

      // then
      assert.dom('.organization__data').exists();
    });

    test('it should revert changes on click to cancel button', async function(assert) {
      // given
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);
      await click('button[aria-label=\'Editer\'');
      await fillIn('input#name', 'new name');
      await fillIn('input#externalId', 'new externalId');
      await fillIn('input#provinceCode', 'new provinceCode');

      // when
      await click('button[aria-label=\'Annuler\'');

      // then
      assert.dom('.organization__name').hasText(organization.name);
      assert.dom('.organization__externalId').hasText(organization.externalId);
      assert.dom('.organization__provinceCode').hasText(organization.provinceCode);
    });

    test('it should submit the form if there is no error', async function(assert) {
      // given
      this.set('onSubmit', () => {});
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} @onSubmit={{this.onSubmit}} />`);
      await click('button[aria-label=\'Editer\'');
      await fillIn('input#name', 'new name');
      await fillIn('input#externalId', 'new externalId');
      await fillIn('input#provinceCode', '  ');

      // when
      await click('button[aria-label=\'Enregistrer\'');

      // then
      assert.dom('.organization__name').hasText('new name');
      assert.dom('.organization__externalId').hasText('new externalId');
      assert.dom('.organization__provinceCode').doesNotExist();
    });
  });

  module('When organization is SCO', function(hooks) {

    hooks.beforeEach(function() {
      this.organization = EmberObject.create({ type: 'SCO', isOrganizationSCO: true, isManagingStudents: true });
    });

    test('it should display if it is managing students', async function(assert) {
      // when
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // then
      assert.dom('.organization__isManagingStudents').exists();
    });

    test('it should display "Oui" if it is managing students', async function(assert) {
      // given
      this.organization.isManagingStudents = true;

      // when
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      assert.dom('.organization__isManagingStudents').hasText('Oui');
    });

    test('it should display "Non" if managing students is false', async function(assert) {
      // given
      this.organization.isManagingStudents = false;

      // when
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // then
      assert.dom('.organization__isManagingStudents').hasText('Non');
    });
  });

  module('When organization is not SCO', function(hooks) {

    hooks.beforeEach(function() {
      this.organization = EmberObject.create({ type: 'PRO', isOrganizationSCO: false });
    });

    test('it should not display if it is managing students', async function(assert) {
      // given
      this.organization.isManagingStudents = false;

      // when
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);

      // then
      assert.dom('.organization__isManagingStudents').doesNotExist();
    });
  });
});
