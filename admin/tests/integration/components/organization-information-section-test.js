import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | organization-information-section', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const organization = EmberObject.create({ type: 'SUP', isManagingStudents: false });

    this.set('organization', organization);
    await render(hbs`{{organization-information-section organization=organization}}`);

    assert.dom('.organization__information').exists();
  });

  test('it should display credit', async function(assert) {
    // given
    const organization = EmberObject.create({ credit: 350 });
    this.set('organization', organization);

    // when
    await render(hbs`{{organization-information-section organization=organization}}`);

    // then
    assert.dom('.organization__credit').hasText('350');
  });

  module('When organization is SCO', function(hooks) {

    let organization;

    hooks.beforeEach(function() {
      organization = EmberObject.create({ type: 'SCO', isManagingStudents: true });
    });

    test('it should display if it is managing students', async function(assert) {
      this.set('organization', organization);
      await render(hbs`{{organization-information-section organization=organization}}`);

      assert.dom('.organization__isManagingStudents').exists();
    });

    test('it should display "Oui" if it is managing students', async function(assert) {
      this.set('organization', organization);
      await render(hbs`{{organization-information-section organization=organization}}`);

      assert.dom('.organization__isManagingStudents').hasText('Oui');
    });

    test('it should display "Non" if managing students is false', async function(assert) {
      organization.isManagingStudents = false;
      this.set('organization', organization);
      await render(hbs`{{organization-information-section organization=organization}}`);

      assert.dom('.organization__isManagingStudents').hasText('Non');
    });
  });

  module('When organization is not SCO', function() {

    test('it should not display if it is managing students', async function(assert) {
      const organization = EmberObject.create({ type: 'PRO', isManagingStudents: false });

      this.set('organization', organization);
      await render(hbs`{{organization-information-section organization=organization}}`);

      assert.dom('.organization__isManagingStudents').doesNotExist();
    });
  });
});
