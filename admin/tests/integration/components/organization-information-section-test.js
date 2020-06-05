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
      organization = EmberObject.create({ id: 1, name: 'Organization SCO', externalId: 'VELIT', provinceCode: 'h50' });
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

    test('it should revert form changes on click to cancel button', async function(assert) {
      // given
      await render(hbs`<OrganizationInformationSection @organization={{this.organization}} />`);
      await click('button[aria-label=\'Editer\'');
      await fillIn('input#name', 'new name');
      await fillIn('input#externalId', 'new externalId');
      await fillIn('input#provinceCode', 'new provinceCode');

      // when
      await click('button[aria-label=\'Annuler\'');
      await click('button[aria-label=\'Editer\'');

      // then
      assert.dom('input#name').hasValue(organization.name);
      assert.dom('input#externalId').hasValue(organization.externalId);
      assert.dom('input#provinceCode').hasValue(organization.provinceCode);
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
