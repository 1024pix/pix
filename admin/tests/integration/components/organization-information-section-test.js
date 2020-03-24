import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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
