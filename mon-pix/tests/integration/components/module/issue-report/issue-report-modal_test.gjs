import { render, within } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import ModulixIssueReportModal from 'mon-pix/components/module/issue-report/issue-report-modal';
import { categoriesKey } from 'mon-pix/models/module-issue-report';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Issue Report | Issue Report Modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display issue-report modal with a form inside', async function (assert) {
    // given
    // when
    const screen = await render(
      <template>
        <div id="modal-container">
          <ModulixIssueReportModal @showModal={{true}} />
        </div>
      </template>,
    );

    // then
    assert.dom(screen.getByRole('dialog')).exists();
    assert.dom(screen.getByRole('heading', { name: t('pages.modulix.issue-report.modal.title'), level: 1 })).exists();
    assert.dom(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') })).exists();
    assert.dom(screen.getByRole('textbox', { name: t('pages.modulix.issue-report.modal.textarea-label') })).exists();
    assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
    assert.dom(screen.getByRole('button', { name: t('common.actions.send') })).exists();
  });

  module('when user fills the form and clicks on send button', function () {
    test('should call onSendReport function with issue report information', async function (assert) {
      // given
      const hideModal = sinon.stub();
      const onSendReport = sinon.stub();

      // when
      const screen = await render(
        <template>
          <div id="modal-container">
            <ModulixIssueReportModal @showModal={{true}} @hideModal={{hideModal}} @onSendReport={{onSendReport}} />
          </div>
        </template>,
      );

      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') }));
      await screen.findByRole('listbox');
      await click(
        screen.getByRole('option', { name: t('pages.modulix.issue-report.modal.categories.feedback.question-issue') }),
      );

      await fillIn(
        screen.getByRole('textbox', { name: t('pages.modulix.issue-report.modal.textarea-label') }),
        'Mon super commentaire',
      );

      await click(screen.getByRole('button', { name: t('common.actions.send') }));

      // then
      sinon.assert.calledOnceWithExactly(onSendReport, {
        categoryKey: categoriesKey.QUESTION_ISSUE,
        comment: 'Mon super commentaire',
      });

      assert.ok(true);
    });
  });

  module('when user do not fill the comment section and clicks on send button', function () {
    test('should display an error', async function (assert) {
      // given
      const hideModal = sinon.stub();
      const onSendReport = sinon.stub();

      // when
      const screen = await render(
        <template>
          <div id="modal-container">
            <ModulixIssueReportModal @showModal={{true}} @hideModal={{hideModal}} @onSendReport={{onSendReport}} />
          </div>
        </template>,
      );

      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') }));
      await screen.findByRole('listbox');
      await click(
        screen.getByRole('option', { name: t('pages.modulix.issue-report.modal.categories.feedback.question-issue') }),
      );
      await click(screen.getByRole('button', { name: t('common.actions.send') }));

      // then
      sinon.assert.notCalled(onSendReport);
      assert.dom(screen.getByText(t('pages.modulix.issue-report.error-messages.missing-comment'))).exists();
    });
  });

  module('when user report an embed or custom element', function () {
    test('should display specific categories on select', async function (assert) {
      // given
      const hideModal = sinon.stub();
      const onSendReport = sinon.stub();
      const elementType = 'custom';

      // when
      const screen = await render(
        <template>
          <div id="modal-container">
            <ModulixIssueReportModal
              @showModal={{true}}
              @hideModal={{hideModal}}
              @onSendReport={{onSendReport}}
              @elementType={{elementType}}
            />
          </div>
        </template>,
      );

      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') }));
      const listbox = await screen.findByRole('listbox');

      // then
      const options = within(listbox).getAllByRole('option');
      assert.strictEqual(options.length, 4);
      assert
        .dom(
          screen.getByRole('option', {
            name: t('pages.modulix.issue-report.modal.categories.custom-and-embed.instruction-issue'),
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('option', {
            name: t('pages.modulix.issue-report.modal.categories.custom-and-embed.embed-not-working'),
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('option', {
            name: t('pages.modulix.issue-report.modal.categories.default.accessibility-issue'),
          }),
        )
        .exists();
      assert
        .dom(screen.getByRole('option', { name: t('pages.modulix.issue-report.modal.categories.default.other') }))
        .exists();
    });
  });

  module('when user report an element with a feedback', function () {
    test('should display specific categories on select', async function (assert) {
      // given
      const hideModal = sinon.stub();
      const onSendReport = sinon.stub();
      const elementType = 'qab';

      // when
      const screen = await render(
        <template>
          <div id="modal-container">
            <ModulixIssueReportModal
              @showModal={{true}}
              @hideModal={{hideModal}}
              @onSendReport={{onSendReport}}
              @elementType={{elementType}}
            />
          </div>
        </template>,
      );

      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') }));
      const listbox = await screen.findByRole('listbox');

      // then
      const options = within(listbox).getAllByRole('option');
      assert.strictEqual(options.length, 5);
      assert
        .dom(
          screen.getByRole('option', {
            name: t('pages.modulix.issue-report.modal.categories.feedback.question-issue'),
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('option', {
            name: t('pages.modulix.issue-report.modal.categories.feedback.response-issue'),
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('option', { name: t('pages.modulix.issue-report.modal.categories.feedback.improvement') }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('option', {
            name: t('pages.modulix.issue-report.modal.categories.default.accessibility-issue'),
          }),
        )
        .exists();
      assert
        .dom(screen.getByRole('option', { name: t('pages.modulix.issue-report.modal.categories.default.other') }))
        .exists();
    });
  });
});
