import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';

import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import {
  v3CertificationIssueReportCategories,
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

  module('when session is V2', function () {
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
              @version={{2}}
            />
          `);

      // then
      for (const category of Object.values(certificationIssueReportCategories)) {
        assert
          .dom(
            screen.getByLabelText(`${categoryToCode[category]} ${this.intl.t(categoryToLabel[category])}`, {
              exact: false,
            }),
          )
          .exists();
      }
    });
  });

  module('when session is V3', function () {
    test('it should show all V3 categories code & label', async function (assert) {
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
              @version={{3}}
            />
          `);

      // then
      for (const category of Object.values(v3CertificationIssueReportCategories)) {
        assert
          .dom(
            screen.getByLabelText(`${categoryToCode[category]} ${this.intl.t(categoryToLabel[category])}`, {
              exact: false,
            }),
          )
          .exists();
      }
      assert
        .dom(
          screen.queryByLabelText('E1-E12 Problème technique sur une question', {
            exact: false,
          }),
        )
        .doesNotExist();
    });
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
