import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';

import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import {
  certificationIssueReportCategories,
  categoryToLabel,
  categoryToCode,
} from 'pix-certif/models/certification-issue-report';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | add-issue-report-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

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
    const screen = await renderScreen(hbs`
          <IssueReportModal::AddIssueReportModal
            @closeModal={{this.closeAddIssueReportModal}}
            @report={{this.reportToEdit}}
            @maxlength={{@issueReportDescriptionMaxLength}}
          />
        `);

    // then
    assert.dom(screen.getByText('Signalement du candidat : Lisa Monpud', { exact: false })).exists();
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
    const screen = await renderScreen(hbs`
          <IssueReportModal::AddIssueReportModal
            @closeModal={{this.closeAddIssueReportModal}}
            @report={{this.reportToEdit}}
            @maxlength={{@issueReportDescriptionMaxLength}}
          />
        `);

    // then
    for (const category of Object.values(certificationIssueReportCategories)) {
      assert
        .dom(screen.getByLabelText(`${categoryToCode[category]} ${categoryToLabel[category]}`, { exact: false }))
        .exists();
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

    // when
    const screen = await renderScreen(hbs`
          <IssueReportModal::AddIssueReportModal
            @closeModal={{this.closeAddIssueReportModal}}
            @report={{this.reportToEdit}}
            @maxlength={{@issueReportDescriptionMaxLength}}
          />
        `);

    // when
    await click(screen.getByLabelText('Ajouter le signalement'));

    // then
    assert.dom(screen.getByText('Veuillez selectionner une catégorie')).exists();
  });
});
