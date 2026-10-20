import { render } from '@1024pix/ember-testing-library';
import { clickByName } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Acceptance from 'pix-orga/components/terms-of-service/acceptance';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | terms of service | Acceptance', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays terms of service acceptance', async function (assert) {
    // given
    const legalDocumentStatus = 'requested';
    const legalDocumentPath = 'legal-document.pdf';

    // when
    const screen = await render(
      <template>
        <Acceptance @legalDocumentStatus={{legalDocumentStatus}} @legalDocumentPath={{legalDocumentPath}} />
      </template>,
    );

    // then
    assert.ok(screen.getByRole('heading', { name: t('components.terms-of-service.title.requested') }));
    assert.ok(screen.getByText(t('components.terms-of-service.message.requested')));
    assert
      .dom(screen.getByRole('link', { name: t('components.terms-of-service.actions.document-link') }))
      .hasAttribute('href', `https://pix.org/fr/${legalDocumentPath}`);
    assert.ok(screen.getByRole('link', { name: t('components.terms-of-service.actions.reject') }));
    assert.ok(screen.getByRole('button', { name: t('components.terms-of-service.actions.accept') }));
  });

  test('it displays updated terms of service acceptance', async function (assert) {
    // given
    const legalDocumentStatus = 'update-requested';
    const legalDocumentPath = 'legal-document.pdf';

    // when
    const screen = await render(
      <template>
        <Acceptance @legalDocumentStatus={{legalDocumentStatus}} @legalDocumentPath={{legalDocumentPath}} />
      </template>,
    );

    // then
    assert.ok(screen.getByRole('heading', { name: t('components.terms-of-service.title.update-requested') }));
    assert.ok(screen.getByText(t('components.terms-of-service.message.update-requested')));
  });

  module('when user accepts terms of service', function () {
    test('it triggers the acceptance', async function (assert) {
      // given
      const legalDocumentStatus = 'requested';
      const legalDocumentPath = 'legal-document.pdf';
      const onSubmit = sinon.stub();

      // when
      await render(
        <template>
          <Acceptance
            @legalDocumentStatus={{legalDocumentStatus}}
            @legalDocumentPath={{legalDocumentPath}}
            @onSubmit={{onSubmit}}
          />
        </template>,
      );

      // then
      await clickByName(t('components.terms-of-service.actions.accept'));
      assert.ok(onSubmit.calledOnce);
    });
  });
});
