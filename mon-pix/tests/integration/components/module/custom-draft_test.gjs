import { clickByName, render, within } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import ModulixCustomDraft from 'mon-pix/components/module/element/custom-draft';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { waitForDialog } from '../../../helpers/wait-for';

module('Integration | Component | Module | CustomDraft', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a customDraft with instruction', async function (assert) {
    // given
    const customDraft = {
      id: 'id',
      title: 'title',
      url: 'https://example.org',
      instruction: '<p>Instruction du POIC</p>',
      height: 400,
    };

    // when
    const screen = await render(<template><ModulixCustomDraft @customDraft={{customDraft}} /></template>);

    // then
    assert.ok(screen);
    const expectedIframe = screen.getByTitle(customDraft.title);
    assert.strictEqual(expectedIframe.getAttribute('src'), customDraft.url);
    assert.strictEqual(window.getComputedStyle(expectedIframe).getPropertyValue('height'), `${customDraft.height}px`);
    assert
      .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.interactive-element.reset.ariaLabel') }))
      .exists();
    assert.dom(screen.getByText('Instruction du POIC')).exists();
  });

  test('should display a customDraft without instruction', async function (assert) {
    // given
    const customDraft = {
      id: 'id',
      title: 'title',
      isCompletionRequired: false,
      url: 'https://example.org',
      height: 400,
    };

    // when
    await render(<template><ModulixCustomDraft @customDraft={{customDraft}} /></template>);

    // then
    assert.dom(find('.element-customDraft__instruction')).doesNotExist();
  });

  module('when user clicks on reset button', function () {
    test('should focus on the iframe', async function (assert) {
      // given
      const passageEventService = this.owner.lookup('service:passageEvents');
      sinon.stub(passageEventService, 'record');
      const customDraft = {
        id: 'id',
        title: 'title',
        isCompletionRequired: false,
        url: 'https://example.org',
        height: 400,
      };
      const screen = await render(<template><ModulixCustomDraft @customDraft={{customDraft}} /></template>);

      // when
      await clickByName(t('pages.modulix.buttons.interactive-element.reset.ariaLabel'));

      // then
      const iframe = screen.getByTitle(customDraft.title);
      assert.strictEqual(document.activeElement, iframe);
    });

    test('should send an event', async function (assert) {
      // given
      const passageEventService = this.owner.lookup('service:passageEvents');
      const passageEventRecordStub = sinon.stub(passageEventService, 'record');
      const customDraftElement = {
        id: 'id',
        title: 'title',
        isCompletionRequired: true,
        url: 'https://example.org',
        height: 400,
      };
      const screen = await render(<template><ModulixCustomDraft @customDraft={{customDraftElement}} /></template>);

      // when
      const resetButton = screen.getByRole('button', {
        name: t('pages.modulix.buttons.interactive-element.reset.ariaLabel'),
      });
      await click(resetButton);

      // then
      sinon.assert.calledOnceWith(passageEventRecordStub, {
        type: 'CUSTOM_DRAFT_RETRIED',
        data: {
          elementId: customDraftElement.id,
        },
      });
      assert.ok(true);
    });
  });

  test('should display report button', async function (assert) {
    // given
    const customDraft = {
      id: 'id',
      title: 'title',
      url: 'https://example.org',
      instruction: '<p>Instruction du POIC</p>',
      height: 400,
    };

    // when
    const screen = await render(<template><ModulixCustomDraft @customDraft={{customDraft}} /></template>);

    // then
    assert.dom(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') })).exists();
  });

  module('when user clicks on report button', function () {
    test('should display issue-report modal with a form inside', async function (assert) {
      // given
      const customDraft = {
        id: 'id',
        title: 'title',
        url: 'https://example.org',
        instruction: '<p>Instruction du POIC</p>',
        height: 400,
        type: 'custom-draft',
      };

      // when
      const screen = await render(
        <template>
          <div id="modal-container"></div>
          <ModulixCustomDraft @customDraft={{customDraft}} />
        </template>,
      );
      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));
      await waitForDialog();

      // then
      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.modal.select-label') }));
      const listbox = await screen.findByRole('listbox');
      const options = within(listbox).getAllByRole('option');
      assert.strictEqual(options.length, 4);
    });
  });
});
