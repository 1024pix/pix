import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | information-banner', function(hooks) {
  setupIntlRenderingTest(hooks);

  module('Import Banner', () => {
    module('when prescriber’s organization is of type SCO that manages students', function() {
      module('when prescriber has not imported student yet', function() {
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: false }
          isSCOManagingStudents = true;
        }

        test('should render the banner', async function(assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          await render(hbs`<InformationBanner/>`);

          // then
          assert.dom('a[href="https://view.genial.ly/5f295b80302a810d2ff9fa60/?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23"]').exists();
          assert.dom('a[href="https://view.genial.ly/5f46390591252c0d5246bb63/?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23"]').exists();
          assert.dom('.pix-banner').includesText('Rentrée 2020 : l’administrateur doit importer ou ré-importer la base élèves pour initialiser Pix Orga. Plus d’info collège et lycée (GT et Pro)');
        });
      });

      module('when prescriber has already imported students', function() {
        test('should not render the banner', async function(assert) {
          // given
          class CurrentUserStub extends Service {
            prescriber = { areNewYearSchoolingRegistrationsImported: true }
            isSCOManagingStudents = true;
          }
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          await render(hbs`<InformationBanner/>`);

          // then
          assert.dom('.pix-banner').doesNotIncludeText('Rentrée 2020 : l’administrateur doit importer ou ré-importer la base élèves pour initialiser Pix Orga. Plus d’info collège et lycée (GT et Pro)');
        });
      });
    });

    module('when prescriber’s organization is not of type SCO that manages students', function() {

      test('should not render the banner regardless of whether students have been imported or not', async function(assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: false }
          isSCOManagingStudents = false;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(hbs`<InformationBanner/>`);

        // then
        assert.dom('.pix-banner').doesNotExist();
      });

    });
  });

  module('Campaign Banner', () => {
    module('when prescriber’s organization is of type SCO that manages students', function() {
      test('should render the campaign banner for non agriculture', async function(assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: true }
          isSCOManagingStudents = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(hbs`<InformationBanner/>`);

        // then
        assert.dom('a[href="https://view.genial.ly/5fda0b5aebe82c0d17f177ea"]').exists();
        assert.dom('.pix-banner').includesText('Il est important de vérifier que les élèves soient certifiables avant de les inscrire en session de certification. Vous pouvez faire une campagne de collecte de profils pour vous en assurer.');
      });

      test('should render the campaign banner with specific link for agriculture', async function(assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: true }
          isSCOManagingStudents = true;
          isAgriculture = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(hbs`<InformationBanner/>`);

        // then
        assert.dom('a[href="https://view.genial.ly/6034cdf633f5220dc1eb101d"]').exists();
      });
    });

    module('when prescriber’s organization is not of type SCO that manages students', function() {
      test('should not display the campaign banner', async function(assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: true }
          isSCOManagingStudents = false;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(hbs`<InformationBanner/>`);

        // then
        assert.dom('.pix-banner').doesNotExist();
      });
    });
  });
});
