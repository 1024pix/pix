import { render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  categoryToCode,
  categoryToLabel,
  certificationIssueReportCategories,
  v3CertificationIssueReportCategories,
} from 'pix-certif/models/certification-issue-report';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | add-issue-report-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it show candidate informations in title', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const report = store.createRecord('certification-report', {
      firstName: 'Lisa',
      lastName: 'Monpud',
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
            @maxlength={{this.maxLength}}
          />
        `);

    // then
    assert.dom(screen.getByText('Signalement du candidat : Lisa Monpud', { exact: false })).exists();
  });

  module('when session is V2', function () {
    test('it should show all categories code & label', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const report = store.createRecord('certification-report', {
        firstName: 'Lisa',
        lastName: 'Monpud',
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
              @maxlength={{this.maxlength}}
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
      const store = this.owner.lookup('service:store');
      const report = store.createRecord('certification-report', {
        firstName: 'Lisa',
        lastName: 'Monpud',
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
              @maxlength={{this.maxlength}}
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
    const store = this.owner.lookup('service:store');
    const report = store.createRecord('certification-report', {
      firstName: 'Lisa',
      lastName: 'Monpud',
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
            @maxlength={{this.maxLength}}
          />
        `);

    // when
    await click(screen.getByLabelText('Ajouter le signalement'));

    // then
    assert.dom(screen.getByText('Veuillez selectionner une catégorie')).exists();
  });
});
