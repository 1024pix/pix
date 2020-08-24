import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | information-banner', function(hooks) {
  setupRenderingTest(hooks);

  let prescriber;

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

      test('should not render the banner', async function(assert) {
        // given
        prescriber = { areNewYearSchoolingRegistrationsImported: true };
        this.owner.register('service:current-user', Service.extend({ prescriber, isSCOManagingStudents }));

        // when
        await render(hbs`<InformationBanner/>`);

        // then
        assert.dom('.pix-banner').doesNotExist();
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
