import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import {
  certificationIssueReportCategories,
  categoryToLabel,
  categoryToCode,
} from 'pix-certif/models/certification-issue-report';

module('Integration | Component | add-issue-report-modal', (hooks) => {
  setupRenderingTest(hooks);

  test('it show candidate informations in title', async function(assert) {
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

  test('it should show all categories code & label', async function(assert) {
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
    for (const category of Object.values(certificationIssueReportCategories)) {
      assert.contains(`${categoryToCode[category]}\u00a0${categoryToLabel[category]}`);
    }
  });

  test('it should show an error when trying to submit without selecting a category', async function(assert) {
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
