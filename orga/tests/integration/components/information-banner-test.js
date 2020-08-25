import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | information-banner', function(hooks) {
  setupRenderingTest(hooks);

  let prescriber;

  module('Import Banner', () => {
    module('when prescriber’s organization is of type SCO that manages students', function() {
      const isSCOManagingStudents = true;

      module('when prescriber has not imported student yet', function() {

        test('should render the banner', async function(assert) {
          // given
          prescriber = { areNewYearSchoolingRegistrationsImported: false };
          this.owner.register('service:current-user', Service.extend({ prescriber, isSCOManagingStudents }));

          // when
          await render(hbs`<InformationBanner/>`);

          // then
          assert.contains('Importer la base Élèves');
          assert.dom('a[href="https://view.genial.ly/5f295b80302a810d2ff9fa60/?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23"]').exists();
          assert.dom('.pix-banner').includesText('Rentrée 2020 : l’administrateur doit importer ou ré-importer la base élèves pour initialiser Pix Orga');
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
          prescriber = { areNewYearSchoolingRegistrationsImported: true };
          this.owner.register('service:current-user', Service.extend({ prescriber, isSCOManagingStudents }));

          // when
          await render(hbs`<InformationBanner/>`);

          // then
          assert.dom('.pix-banner').doesNotIncludeText('Rentrée 2020 : l’administrateur doit importer ou ré-importer la base élèves pour initialiser Pix Orga');
        });
      });
    });

    module('when prescriber’s organization is not of type SCO that manages students', function() {

      test('should not render the banner regardless of whether students have been imported or not', async function(assert) {
        // given
        prescriber = { areNewYearSchoolingRegistrationsImported: false };
        this.owner.register('service:current-user', Service.extend({ prescriber, isSCOManagingStudents: false }));

        // when
        await render(hbs`<InformationBanner/>`);

        // then
        assert.dom('.pix-banner').doesNotExist();
      });

    });
  });

  module('Campaign Banner', () => {
    module('when prescriber’s organization is of type SCO that manages students', function() {
      const isSCOManagingStudents = true;

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
          prescriber = { areNewYearSchoolingRegistrationsImported: true };
          this.owner.register('service:current-user', Service.extend({ prescriber, isSCOManagingStudents }));

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
          prescriber = { areNewYearSchoolingRegistrationsImported: true };
          this.owner.register('service:current-user', Service.extend({ prescriber, isSCOManagingStudents }));

          // when
          await render(hbs`<InformationBanner/>`);

          // then
          assert.dom('a[href="https://view.genial.ly/5f295b80302a810d2ff9fa60/?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba"]').exists();
          assert.dom('.pix-banner').includesText('Parcours de rentrée 2020 : les codes sont disponibles dans l’onglet campagnes. N’oubliez pas de les diffuser aux élèves avant la Toussaint.');
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
        prescriber = { areNewYearSchoolingRegistrationsImported: true };
        this.owner.register('service:current-user', Service.extend({ prescriber, isSCOManagingStudents: false }));

        // when
        await render(hbs`<InformationBanner/>`);

        // then
        assert.dom('.pix-banner').doesNotExist();
      });
    });
  });
});
