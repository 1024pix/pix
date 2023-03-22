import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module(
  'Integration | Component | issue-report-modal/non-blocking-technical-issue-certification-issue-report-fields',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('it should call toggle function on click radio button', async function (assert) {
      // given
      const toggleOnCategory = sinon.stub();
      const nonBlockingTechnicalIssueCategory = { isChecked: false };
      this.set('toggleOnCategory', toggleOnCategory);
      this.set('nonBlockingTechnicalIssueCategory', nonBlockingTechnicalIssueCategory);

      // when
      const screen = await renderScreen(hbs`
      <IssueReportModal::NonBlockingTechnicalIssueCertificationIssueReportFields
        @nonBlockingTechnicalIssueCategory={{this.nonBlockingTechnicalIssueCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
      await click(screen.getByRole('radio'));

      // then
      assert.ok(toggleOnCategory.calledOnceWith(nonBlockingTechnicalIssueCategory));
    });

    test('it should show textarea if category is checked', async function (assert) {
      // given
      const toggleOnCategory = sinon.stub();
      const nonBlockingTechnicalIssueCategory = { isChecked: true };
      this.set('toggleOnCategory', toggleOnCategory);
      this.set('nonBlockingTechnicalIssueCategory', nonBlockingTechnicalIssueCategory);

      // when
      const screen = await renderScreen(hbs`
      <IssueReportModal::NonBlockingTechnicalIssueCertificationIssueReportFields
        @nonBlockingTechnicalIssueCategory={{this.nonBlockingTechnicalIssueCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
      await click(screen.getByRole('radio'));

      // then
      assert.dom(screen.getByText("Décrivez l'incident rencontré")).exists();
    });

    test('it should show information message if category is checked', async function (assert) {
      // given
      const toggleOnCategory = sinon.stub();
      const nonBlockingTechnicalIssueCategory = { isChecked: true };
      this.set('toggleOnCategory', toggleOnCategory);
      this.set('nonBlockingTechnicalIssueCategory', nonBlockingTechnicalIssueCategory);

      // when
      const screen = await renderScreen(hbs`
      <IssueReportModal::NonBlockingTechnicalIssueCertificationIssueReportFields
        @nonBlockingTechnicalIssueCategory={{this.nonBlockingTechnicalIssueCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
      await click(screen.getByRole('radio'));

      // then
      assert
        .dom(
          screen.getByText(
            "Signalement à titre informatif, le problème rencontré n'a pas empêché le candidat de continuer à répondre aux questions. En cas d’incident sur une question focus, merci de vous reporter à la catégorie E10."
          )
        )
        .exists();
    });
  }
);
