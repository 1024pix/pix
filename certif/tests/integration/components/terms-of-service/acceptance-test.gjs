import { clickByName, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Acceptance from 'pix-certif/components/terms-of-service/acceptance';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | terms-of-service | acceptance', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays terms of service acceptance', async function (assert) {
    // given
    const legalDocumentStatus = 'requested';
    const legalDocumentPath = 'pix-certif-tos-2025-01-01';

    // when
    const screen = await render(
      <template>
        <Acceptance @legalDocumentStatus={{legalDocumentStatus}} @legalDocumentPath={{legalDocumentPath}} />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: t('components.terms-of-service.title.requested') })).exists();
    assert.dom(screen.getByText(t('components.terms-of-service.message.requested'))).exists();
    assert
      .dom(screen.getByRole('link', { name: t('components.terms-of-service.actions.document-link') }))
      .hasAttribute('href', `https://pix.org/fr/${legalDocumentPath}`);
    assert.dom(screen.getByRole('link', { name: t('components.terms-of-service.actions.reject') })).exists();
    assert.dom(screen.getByRole('button', { name: t('components.terms-of-service.actions.accept') })).exists();
  });

  test('it displays updated terms of service acceptance', async function (assert) {
    // given
    const legalDocumentStatus = 'update-requested';
    const legalDocumentPath = 'pix-certif-tos-2025-01-01';

    // when
    const screen = await render(
      <template>
        <Acceptance @legalDocumentStatus={{legalDocumentStatus}} @legalDocumentPath={{legalDocumentPath}} />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: t('components.terms-of-service.title.update-requested') })).exists();
    assert.dom(screen.getByText(t('components.terms-of-service.message.update-requested'))).exists();
  });

  module('when user accepts terms of service', function () {
    test('it triggers the acceptance', async function (assert) {
      // given
      const legalDocumentStatus = 'requested';
      const legalDocumentPath = 'pix-certif-tos-2025-01-01';
      const onSubmit = sinon.stub();

      await render(
        <template>
          <Acceptance
            @legalDocumentStatus={{legalDocumentStatus}}
            @legalDocumentPath={{legalDocumentPath}}
            @onSubmit={{onSubmit}}
          />
        </template>,
      );

      // when
      await clickByName(t('components.terms-of-service.actions.accept'));

      // then
      assert.ok(onSubmit.calledOnce);
    });
  });
});
