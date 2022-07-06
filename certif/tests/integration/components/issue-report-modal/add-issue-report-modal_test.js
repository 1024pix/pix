import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import omit from 'lodash/omit';

import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import {
  certificationIssueReportCategories,
  categoryToLabel,
  categoryToCode,
} from 'pix-certif/models/certification-issue-report';

module('Integration | Component | add-issue-report-modal', function (hooks) {
  setupRenderingTest(hooks);

  const featureToggles = {
    isCertificationFreeFieldsDeletionEnabled: false,
  };

  hooks.beforeEach(function () {
    class FeatureTogglesStub extends Service {
      featureToggles = featureToggles;
    }
    this.owner.register('service:feature-toggles', FeatureTogglesStub);
  });

  module('when FT_CERTIFICATION_FREE_FIELDS_DELETION is disabled', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(featureToggles, 'isCertificationFreeFieldsDeletionEnabled').value(false);
    });

    test('it should show former code & label for IN_CHALLENGE', async function (assert) {
      // given
      const report = EmberObject.create({
        certificationCourseId: 1,
        firstName: 'Lisa',
        lastName: 'Monpud',
        hasSeenEndTestScreen: false,
      });
      const closeAddIssueReportModalStub = sinon.stub();
      this.set('closeAddIssueReportModal', closeAddIssueReportModalStub);
      this.set('reportToEdit', report);
      this.set('maxlength', 500);

      // when
      await render(hbs`
          <IssueReportModal::AddIssueReportModal
            @closeModal={{this.closeAddIssueReportModal}}
            @report={{this.reportToEdit}}
            @maxlength={{@issueReportDescriptionMaxLength}}
          />
        `);

      // then
      assert.contains(`E1-E10\u00a0${categoryToLabel['IN_CHALLENGE']}`);
    });

    test('it should show OTHER category', async function (assert) {
      // given
      const report = EmberObject.create({
        certificationCourseId: 1,
        firstName: 'Lisa',
        lastName: 'Monpud',
        hasSeenEndTestScreen: false,
      });
      const closeAddIssueReportModalStub = sinon.stub();
      this.set('closeAddIssueReportModal', closeAddIssueReportModalStub);
      this.set('reportToEdit', report);
      this.set('maxlength', 500);

      // when
      await render(hbs`
          <IssueReportModal::AddIssueReportModal
            @closeModal={{this.closeAddIssueReportModal}}
            @report={{this.reportToEdit}}
            @maxlength={{@issueReportDescriptionMaxLength}}
          />
        `);

      // then
      assert.contains(`Autre (si aucune des catégories ci-dessus ne correspond au signalement)`);
    });
  });

  module('when FT_CERTIFICATION_FREE_FIELDS_DELETION is enabled', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(featureToggles, 'isCertificationFreeFieldsDeletionEnabled').value(true);
    });

    test('it should not show OTHER category', async function (assert) {
      // given
      const report = EmberObject.create({
        certificationCourseId: 1,
        firstName: 'Lisa',
        lastName: 'Monpud',
        hasSeenEndTestScreen: false,
      });
      const closeAddIssueReportModalStub = sinon.stub();
      this.set('closeAddIssueReportModal', closeAddIssueReportModalStub);
      this.set('reportToEdit', report);
      this.set('maxlength', 500);

      // when
      await render(hbs`
          <IssueReportModal::AddIssueReportModal
            @closeModal={{this.closeAddIssueReportModal}}
            @report={{this.reportToEdit}}
            @maxlength={{@issueReportDescriptionMaxLength}}
          />
        `);

      // then
      assert.notContains(`Autre (si aucune des catégories ci-dessus ne correspond au signalement)`);
    });

    test('it show candidate informations in title', async function (assert) {
      // given
      const report = EmberObject.create({
        certificationCourseId: 1,
        firstName: 'Lisa',
        lastName: 'Monpud',
        hasSeenEndTestScreen: false,
      });
      const closeAddIssueReportModalStub = sinon.stub();
      this.set('closeAddIssueReportModal', closeAddIssueReportModalStub);
      this.set('reportToEdit', report);
      this.set('maxlength', 500);

      // when
      await render(hbs`
      <IssueReportModal::AddIssueReportModal
        @closeModal={{this.closeAddIssueReportModal}}
        @report={{this.reportToEdit}}
        @maxlength={{@issueReportDescriptionMaxLength}}
      />
    `);

      // then
      assert.contains('Signalement du candidat');
      assert.contains('Lisa Monpud');
    });

    test('it should show all categories code & label', async function (assert) {
      // given
      const report = EmberObject.create({
        certificationCourseId: 1,
        firstName: 'Lisa',
        lastName: 'Monpud',
        hasSeenEndTestScreen: false,
      });
      const closeAddIssueReportModalStub = sinon.stub();
      this.set('closeAddIssueReportModal', closeAddIssueReportModalStub);
      this.set('reportToEdit', report);
      this.set('maxlength', 500);

      // when
      await render(hbs`
        <IssueReportModal::AddIssueReportModal
          @closeModal={{this.closeAddIssueReportModal}}
          @report={{this.reportToEdit}}
          @maxlength={{@issueReportDescriptionMaxLength}}
        />
      `);

      // then
      for (const category of Object.values(omit(certificationIssueReportCategories, ['OTHER']))) {
        assert.contains(`${categoryToCode[category]}\u00a0${categoryToLabel[category]}`);
      }
    });

    test('it should show an error when trying to submit without selecting a category', async function (assert) {
      // given
      const report = EmberObject.create({
        certificationCourseId: 1,
        firstName: 'Lisa',
        lastName: 'Monpud',
        hasSeenEndTestScreen: false,
      });
      const closeAddIssueReportModalStub = sinon.stub();
      this.set('closeAddIssueReportModal', closeAddIssueReportModalStub);
      this.set('reportToEdit', report);
      this.set('maxlength', 500);
      await render(hbs`
        <IssueReportModal::AddIssueReportModal
          @closeModal={{this.closeAddIssueReportModal}}
          @report={{this.reportToEdit}}
          @maxlength={{@issueReportDescriptionMaxLength}}
        />
      `);

      // when
      await click('[aria-label="Ajouter le signalement"]');

      // then
      assert.contains('Veuillez selectionner une catégorie');
    });
  });
});
