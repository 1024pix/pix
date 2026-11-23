import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import ModuleIssueReportBlock from 'mon-pix/components/module/issue-report/issue-report-block';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { waitForDialog, waitForDialogClose } from '../../../../helpers/wait-for';

module('Integration | Component | Module | Issue Report | Issue Report Block', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a report button', async function (assert) {
    // when
    const screen = await render(<template><ModuleIssueReportBlock /></template>);

    // then
    assert.dom(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') })).exists();
  });

  module('when user clicks on report button', function () {
    test('should open the issue report modal', async function (assert) {
      // when
      const screen = await render(
        <template>
          <div id="modal-container"></div>
          <ModuleIssueReportBlock />
        </template>,
      );
      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));
      await waitForDialog();

      // then
      assert.dom(screen.getByRole('dialog')).exists();
      assert.dom(screen.getByRole('heading', { name: t('pages.modulix.issue-report.modal.title'), level: 1 })).exists();
    });

    module('when user clicks on send button', function () {
      test('should send a report', async function (assert) {
        // given
        const issueReportService = this.owner.lookup('service:moduleIssueReport');
        const recordStub = sinon.stub(issueReportService, 'record');
        const elementId = 'b37e8e8d-9875-4b15-85c0-0373ffbb0805';
        const answer = 42;
        const categoryKey = 'ACCESSIBILITY_ISSUE';
        const comment = 'Mon super commentaire de Noel et de joie';
        const reportInfo = { elementId, answer };

        // when
        const screen = await render(
          <template>
            <div id="modal-container"></div>
            <ModuleIssueReportBlock @reportInfo={{reportInfo}} />
          </template>,
        );
        await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));
        await waitForDialog();

        await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Problème d’accessibilité' }));

        await fillIn(
          screen.getByRole('textbox', { name: t('pages.modulix.issue-report.modal.textarea-label') }),
          comment,
        );

        await click(screen.getByRole('button', { name: t('common.actions.send') }));

        // then
        sinon.assert.calledOnceWithExactly(recordStub, {
          elementId,
          answer,
          categoryKey,
          comment,
        });
        assert.ok(true);
      });

      module('when api call has succeed', function () {
        test('should hide form and display a confirmation message', async function (assert) {
          // given
          const issueReportService = this.owner.lookup('service:moduleIssueReport');
          const elementId = 'b37e8e8d-9875-4b15-85c0-0373ffbb0805';
          const answer = 42;
          const comment = 'Mon super commentaire de Noel et de joie';
          const reportInfo = { elementId, answer };

          sinon.stub(issueReportService, 'record').resolves();

          // when
          const screen = await render(
            <template>
              <div id="modal-container"></div>
              <ModuleIssueReportBlock @reportInfo={{reportInfo}} />
            </template>,
          );
          await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));
          await waitForDialog();

          await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'Problème d’accessibilité' }));

          await fillIn(
            screen.getByRole('textbox', { name: t('pages.modulix.issue-report.modal.textarea-label') }),
            comment,
          );

          await click(screen.getByRole('button', { name: t('common.actions.send') }));

          // then
          assert
            .dom(screen.queryByRole('textbox', { name: t('pages.modulix.issue-report.modal.textarea-label') }))
            .doesNotExist();
          const closeButtons = screen.getAllByRole('button', { name: t('common.actions.close') });
          assert.strictEqual(closeButtons.length, 2);
          assert.dom(screen.getByText(t('pages.modulix.issue-report.modal.confirmation-message.success')));

          await click(closeButtons[0]);
          await waitForDialogClose();

          assert
            .dom(screen.queryByRole('heading', { name: t('pages.modulix.issue-report.modal.title'), level: 1 }))
            .doesNotExist();
        });
      });

      module('when api call has failed', function () {
        test('should display an error message and keep form fulfilled', async function (assert) {
          // given
          const issueReportService = this.owner.lookup('service:moduleIssueReport');
          const elementId = 'b37e8e8d-9875-4b15-85c0-0373ffbb0805';
          const answer = 42;
          const comment = 'Mon super commentaire de Noel et de joie';
          const reportInfo = { elementId, answer };

          sinon.stub(issueReportService, 'record').rejects();

          // when
          const screen = await render(
            <template>
              <div id="modal-container"></div>
              <ModuleIssueReportBlock @reportInfo={{reportInfo}} />
            </template>,
          );
          await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));
          await waitForDialog();

          await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'Problème d’accessibilité' }));

          await fillIn(
            screen.getByRole('textbox', { name: t('pages.modulix.issue-report.modal.textarea-label') }),
            comment,
          );

          await click(screen.getByRole('button', { name: t('common.actions.send') }));

          // then
          const content = screen.getByText(
            (content) =>
              content.startsWith('Une erreur est survenue lors de l‘envoi du commentaire.') &&
              content.endsWith('Veuillez réessayer plus tard.'),
          );
          assert.dom(content).exists();
          assert
            .dom(screen.getByRole('textbox', { name: t('pages.modulix.issue-report.modal.textarea-label') }))
            .hasValue(comment);
        });
      });
    });

    module('when user closes issue-report modal', function () {
      test('should reset the form', async function (assert) {
        // given
        const elementId = 'b37e8e8d-9875-4b15-85c0-0373ffbb0805';
        const answer = 42;
        const reportInfo = { elementId, answer };

        // when
        const screen = await render(
          <template>
            <div id="modal-container"></div>
            <ModuleIssueReportBlock @reportInfo={{reportInfo}} />
          </template>,
        );

        await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));
        await waitForDialog();

        await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Autre' }));

        await fillIn(
          screen.getByRole('textbox', { name: t('pages.modulix.issue-report.modal.textarea-label') }),
          'Mon super commentaire',
        );

        await click(screen.getByRole('button', { name: t('common.actions.cancel') }));
        await waitForDialogClose();

        await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));
        await waitForDialog();

        // then
        const allAccessibilityOptions = screen.getAllByText('Je ne comprends pas la question');
        assert.strictEqual(allAccessibilityOptions.length, 2);
        assert
          .dom(screen.getByRole('textbox', { name: t('pages.modulix.issue-report.modal.textarea-label') }))
          .hasValue('');
      });
    });
  });
});
