import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Student::Sco::HeaderActions', function(hooks) {

  setupIntlRenderingTest(hooks);

  test('it should show title', async function(assert) {
    // when
    await render(hbs`<Student::Sco::HeaderActions />`);

    // then
    assert.contains('Élèves');
  });

  module('user rights', () => {

    module('when user is admin in organization', () => {
      module('when organization is SCO', (hooks) => {
        hooks.beforeEach(function() {
          class CurrentUserStub extends Service {
            isAdminInOrganization = true;
          }
          this.owner.register('service:current-user', CurrentUserStub);
          this.set('importStudentsSpy', () => {});
          return render(hbs`<Student::Sco::HeaderActions @onImportStudents={{importStudentsSpy}} />`);
        });

        test('it should display import XML file button', async function(assert) {
          assert.contains('Importer (.xml ou .zip)');
        });

        test('it should not display download template csv file button for agriculture/cfa organization', async function(assert) {
          assert.notContains('Télécharger le modèle');
        });

        test('it should not display the tooltip for agriculture/cfa organization', async function(assert) {
          assert.notContains('En savoir plus');
        });
      });

      module('when organization is SCO and tagged as Agriculture', (hooks) => {
        hooks.beforeEach(function() {
          class CurrentUserStub extends Service {
            isAdminInOrganization = true;
            isAgriculture = true;
            organization = {};
          }
          this.set('importStudentsSpy', () => {});
          this.owner.register('service:current-user', CurrentUserStub);
          return render(hbs`<Student::Sco::HeaderActions @onImportStudents={{importStudentsSpy}} />`);
        });

        test('it should display import CSV file button', async function(assert) {
          assert.contains('Importer (.csv)');
        });

        test('it should not display download template csv button', async function(assert) {
          // then
          assert.notContains('Télécharger le modèle');
        });

        test('it should not display the tooltip', async function(assert) {
          assert.notContains('En savoir plus');
        });
      });

      module('when organization is SCO and tagged as Agriculture and CFA', (hooks) => {
        hooks.beforeEach(function() {
          class CurrentUserStub extends Service {
            isAdminInOrganization = true;
            isAgriculture = true;
            isCFA = true;
            organization = {};
            prescriber = {
              lang: 'fr',
            };
          }

          this.set('importStudentsSpy', () => {});
          this.owner.register('service:current-user', CurrentUserStub);
          return render(hbs`<Student::Sco::HeaderActions @onImportStudents={{importStudentsSpy}} />`);
        });

        test('it should still display import CSV file button', async function(assert) {
          assert.contains('Importer (.csv)');
        });

        test('it should display download template csv button', async function(assert) {
          // then
          assert.contains('Télécharger le modèle');
        });

        test('it should display the tooltip', async function(assert) {
          assert.contains('En savoir plus');
        });
      });
    });

    module('when user is not admin in organization', (hooks) => {

      hooks.beforeEach(function() {
        class CurrentUserStub extends Service {
          isAdminInOrganization = false;
        }
        this.owner.register('service:current-user', CurrentUserStub);
        return render(hbs`<Student::Sco::HeaderActions />`);
      });

      test('it should not display import button', async function(assert) {
        assert.notContains('Importer (.xml)');
        assert.notContains('Importer (.csv)');
      });
    });
  });
});
