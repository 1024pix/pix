import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | Banner::Information', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Import Banner', () => {
    module('when prescriber’s organization is of type SCO that manages students', function () {
      module('when prescriber has not imported student yet', function () {
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: false };
          organization = { isSco: true };
          isSCOManagingStudents = true;
        }

        test('should render the banner', async function (assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          await render(hbs`<Banner::Information />`);

          // then
          assert
            .dom(
              'a[href="https://view.genial.ly/5f295b80302a810d2ff9fa60/?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23"]'
            )
            .exists();
          assert
            .dom(
              'a[href="https://view.genial.ly/5f46390591252c0d5246bb63/?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23"]'
            )
            .exists();
          assert
            .dom('.pix-banner')
            .includesText(
              'Rentrée 2021 : l’administrateur doit importer ou ré-importer la base élèves pour initialiser Pix Orga. Plus d’info collège et lycée (GT et Pro)'
            );
        });
      });
    });

    module('when prescriber’s organization is of type SCO that manages AGRI students', function () {
      module('when prescriber has not imported student yet', function () {
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: false };
          isSCOManagingStudents = true;
          isAgriculture = true;
        }

        test('should  render the banner', async function (assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          await render(hbs`<Banner::Information />`);

          // then
          assert
            .dom(
              'a[href="https://view.genial.ly/5f295b80302a810d2ff9fa60/?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23"]'
            )
            .doesNotExist();
          assert
            .dom(
              'a[href="https://view.genial.ly/5f46390591252c0d5246bb63/?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23"]'
            )
            .doesNotExist();
          assert
            .dom('.pix-banner')
            .includesText(
              'Rentrée 2021 : l’administrateur doit importer ou ré-importer la base élèves pour initialiser Pix Orga. Plus d’info collège et lycée (GT et Pro)'
            );
        });
      });
    });

    module('when prescriber has already imported students', function () {
      test('should not render the banner', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: true };
          organization = { isSco: true };
          isSCOManagingStudents = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(hbs`<Banner::Information />`);

        // then
        assert
          .dom('.pix-banner')
          .doesNotIncludeText(
            'Rentrée 2021 : l’administrateur doit importer ou ré-importer la base élèves pour initialiser Pix Orga. Plus d’info collège et lycée (GT et Pro)'
          );
      });
    });

    module('when prescriber’s organization is not of type SCO that manages students', function () {
      test('should not render the banner regardless of whether students have been imported or not', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: false };
          organization = { isSco: false };
          isSCOManagingStudents = false;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(hbs`<Banner::Information />`);

        // then
        assert.dom('.pix-banner').doesNotExist();
      });
    });
  });

  module('Campaign Banner', () => {
    module('when prescriber’s organization is of type SCO', function () {
      test('should render the campaign banner', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: true };
          organization = { isSco: true };
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(hbs`<Banner::Information />`);

        // then
        assert
          .dom('.pix-banner')
          .includesText(
            'Parcours de rentrée 2021 : N’oubliez pas de créer les campagnes de rentrée et de diffuser les codes aux élèves avant la Toussaint. Plus d’info collège et lycée (GT et Pro)'
          );
      });

      module('when prescriber’s organization is managing students and is AGRICULTURE', function () {
        test('should display AGRICULTURE links', async function (assert) {
          // given
          class CurrentUserStub extends Service {
            prescriber = { areNewYearSchoolingRegistrationsImported: true };
            organization = { isSco: true };
            isSCOManagingStudents = true;
            isAgriculture = true;
          }
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          await render(hbs`<Banner::Information />`);

          // then
          assert
            .dom(
              'a[href="https://view.genial.ly/5f687a0451337070914e54f9?idSlide=cf788556-ff93-4aba-a5c2-312c450c7553"'
            )
            .exists();
        });
      });

      module('when prescriber’s organization is managing students but is not AGRICULTURE', function () {
        test('should display links', async function (assert) {
          // given
          class CurrentUserStub extends Service {
            prescriber = { areNewYearSchoolingRegistrationsImported: true };
            organization = { isSco: true };
            isSCOManagingStudents = true;
            isAgriculture = false;
          }
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          await render(hbs`<Banner::Information />`);

          // then
          assert
            .dom(
              'a[href="https://view.genial.ly/5f46390591252c0d5246bb63/?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba"'
            )
            .exists();
          assert
            .dom(
              'a[href="https://view.genial.ly/5f295b80302a810d2ff9fa60/?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba"'
            )
            .exists();
        });
      });

      module('when prescriber’s organization is not managing students', function () {
        test('should display default links', async function (assert) {
          // given
          class CurrentUserStub extends Service {
            prescriber = { areNewYearSchoolingRegistrationsImported: true };
            organization = { isSco: true };
            isSCOManagingStudents = false;
            isAgriculture = false;
          }
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          await render(hbs`<Banner::Information />`);

          // then
          assert.dom('a[href="https://kutt.it/prefe"').exists();
        });
      });
    });

    module('when prescriber’s organization is not of type SCO', function () {
      test('should not display the campaign banner', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: true };
          organization = { isSco: false };
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(hbs`<Banner::Information />`);

        // then
        assert.dom('.pix-banner').doesNotExist();
      });
    });
  });
});
