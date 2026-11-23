import { render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'pix-certif/tests/helpers/setup-intl';
import { module, test } from 'qunit';
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
      const screen = await renderScreen(hbs`<IssueReportModal::NonBlockingTechnicalIssueCertificationIssueReportFields
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
      const updateNonBlockingTechnicalIssueCategory = sinon.stub();
      const nonBlockingTechnicalIssueCategory = { isChecked: true };
      this.set('toggleOnCategory', toggleOnCategory);
      this.set('nonBlockingTechnicalIssueCategory', nonBlockingTechnicalIssueCategory);
      this.set('updateNonBlockingTechnicalIssueCategory', updateNonBlockingTechnicalIssueCategory);

      // when
      const screen = await renderScreen(hbs`<IssueReportModal::NonBlockingTechnicalIssueCertificationIssueReportFields
  @nonBlockingTechnicalIssueCategory={{this.nonBlockingTechnicalIssueCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
  @updateNonBlockingTechnicalIssueCategoryDescription={{this.updateNonBlockingTechnicalIssueCategory}}
/>`);
      await click(screen.getByRole('radio'));

      // then
      assert.dom(screen.getByText("Décrivez l'incident rencontré")).exists();
    });

    test('it should show information message if category is checked', async function (assert) {
      // given
      const toggleOnCategory = sinon.stub();
      const updateNonBlockingTechnicalIssueCategory = sinon.stub();
      const nonBlockingTechnicalIssueCategory = { isChecked: true };
      this.set('toggleOnCategory', toggleOnCategory);
      this.set('nonBlockingTechnicalIssueCategory', nonBlockingTechnicalIssueCategory);
      this.set('updateNonBlockingTechnicalIssueCategory', updateNonBlockingTechnicalIssueCategory);

      // when
      const screen = await renderScreen(hbs`<IssueReportModal::NonBlockingTechnicalIssueCertificationIssueReportFields
  @nonBlockingTechnicalIssueCategory={{this.nonBlockingTechnicalIssueCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
  @updateNonBlockingTechnicalIssueCategoryDescription={{this.updateNonBlockingTechnicalIssueCategory}}
/>`);
      await click(screen.getByRole('radio'));

      // then
      assert
        .dom(
          screen.getByText(t('pages.session-finalization.add-issue-modal.non-blocking-issues.technical-information')),
        )
        .exists();
    });
  },
);
