import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Student::Sup::HeaderActions', function(hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('noop', sinon.stub());
  });

  test('it should show title', async function(assert) {
    // when
    await render(hbs`<Student::Sup::HeaderActions @onImportStudents={{noop}}/>`);

    // then
    assert.contains('Étudiants');
  });

  module('when user is admin', function(hooks) {
    hooks.beforeEach(function() {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1 });
        isAdminInOrganization = true;
        prescriber = {
          lang: 'fr',
        }
      }
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it should display download template button', async function(assert) {
      // when
      await render(hbs`<Student::Sup::HeaderActions @onImportStudents={{noop}}/>`);

      // then
      assert.contains('Télécharger le modèle');
    });

    test('it displays the import button', async function(assert) {
      // when
      await render(hbs`<Student::Sup::HeaderActions @onImportStudents={{noop}}/>`);

      // then
      assert.contains('Importer (.csv)');
    });
  });

  module('when user is only member', function(hooks) {
    hooks.beforeEach(function() {
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it should not display download template button', async function(assert) {
      // when
      await render(hbs`<Student::Sup::HeaderActions @onImportStudents={{noop}}/>`);

      // then
      assert.notContains('Télécharger le modèle');
    });

    test('it should not display import button', async function(assert) {
      // when
      await render(hbs`<Student::Sup::HeaderActions @onImportStudents={{noop}}/>`);

      // then
      assert.notContains('Importer (.csv)');
    });
  });
});
