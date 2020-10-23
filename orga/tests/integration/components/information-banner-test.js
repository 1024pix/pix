import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | information-banner', function(hooks) {
  setupRenderingTest(hooks);

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
        const now = new Date('2020-01-01T05:06:07Z');
        let clock;

        hooks.beforeEach(() => {
          clock = sinon.useFakeTimers(now);
        });

        hooks.afterEach(() => {
          clock.restore();
        });

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

    module('when prescriber’s organization is agriculture', function() {

      test('should not display the banner regardless of whether students have been imported or not', async function(assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearSchoolingRegistrationsImported: false }
          isSCOManagingStudents = true;
          isAgriculture = true;
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
      module('when banner dead line has passed', function(hooks) {
        const now = new Date('2020-11-03T00:00:00Z');
        let clock;

        hooks.beforeEach(() => {
          clock = sinon.useFakeTimers(now);
        });

        hooks.afterEach(() => {
          clock.restore();
        });

        test('should not render the campaign banner', async function(assert) {
          // given
          class CurrentUserStub extends Service {
            prescriber = { areNewYearSchoolingRegistrationsImported: true }
            isSCOManagingStudents = true;
          }
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          await render(hbs`<InformationBanner/>`);

          // then
          assert.dom('.pix-banner').doesNotExist();
        });
      });

      module('when banner dead line has not passed', function(hooks) {
        const now = new Date('2019-01-01T05:06:07Z');
        let clock;

        hooks.beforeEach(() => {
          clock = sinon.useFakeTimers(now);
        });

        hooks.afterEach(() => {
          clock.restore();
        });

        test('should render the campaign banner', async function(assert) {
          // given
          class CurrentUserStub extends Service {
            prescriber = { areNewYearSchoolingRegistrationsImported: true }
            isSCOManagingStudents = true;
          }
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          await render(hbs`<InformationBanner/>`);

          // then
          assert.dom('a[href="https://view.genial.ly/5f295b80302a810d2ff9fa60/?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba"]').exists();
          assert.dom('a[href="https://view.genial.ly/5f46390591252c0d5246bb63/?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba"]').exists();
          assert.dom('.pix-banner').includesText('Parcours de rentrée 2020 : les codes sont disponibles dans l’onglet Campagnes. N’oubliez pas de les diffuser aux élèves avant la Toussaint. Plus d’info collège et lycée (GT et Pro)');
        });
      });
    });

    module('when prescriber’s organization is not of type SCO that manages students', function() {
      const now = new Date('2019-01-01T05:06:07Z');
      let clock;

      hooks.beforeEach(() => {
        clock = sinon.useFakeTimers(now);
      });

      hooks.afterEach(() => {
        clock.restore();
      });

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

    module('when prescriber’s organization is agriculture', function() {
      const now = new Date('2019-01-01T05:06:07Z');
      let clock;

      hooks.beforeEach(() => {
        clock = sinon.useFakeTimers(now);
      });

      hooks.afterEach(() => {
        clock.restore();
      });

      test('should not show the campaign banner', async function(assert) {
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
        assert.dom('.pix-banner').doesNotExist();
      });
    });
  });
});
