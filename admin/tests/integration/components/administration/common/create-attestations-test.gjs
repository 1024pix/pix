import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { PixToastContainer } from '@1024pix/nebulix-ember';
import { click, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CreateAttestations from 'pix-admin/components/administration/common/create-attestations';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const fileContent = 'foo';
const file = new Blob([fileContent], { type: `valid-file` });

module('Integration | Component | administration/create-attestations', function (hooks) {
  setupIntlRenderingTest(hooks);
  let requestManagerService;

  hooks.beforeEach(function () {
    requestManagerService = this.owner.lookup('service:requestManager');
    sinon.stub(requestManagerService, 'request');
  });

  module('when all fields are filled', function () {
    test('it should enable submit button', async function (assert) {
      const screen = await render(<template><CreateAttestations /></template>);

      const inputFile = screen.getByLabelText(t('components.administration.create-attestations.upload-button'));
      const submit = screen.getByRole('button', {
        name: t('components.administration.create-attestations.submit-button'),
      });

      await triggerEvent(inputFile, 'change', { files: [file] });
      await fillByLabel(t('components.administration.create-attestations.label'), 'label', { exact: false });
      await fillByLabel(t('components.administration.create-attestations.template-key'), 'key', { exact: false });
      await fillByLabel(t('components.administration.create-attestations.template-name'), 'name', { exact: false });

      assert.dom(submit).doesNotHaveAttribute('aria-disabled');
    });

    test('it should display success notification', async function (assert) {
      // given
      requestManagerService.request.resolves({ response: { ok: true, status: 204 } });

      const screen = await render(
        <template><CreateAttestations /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
      );

      const inputFile = screen.getByLabelText(t('components.administration.create-attestations.upload-button'));
      const submit = screen.getByRole('button', {
        name: t('components.administration.create-attestations.submit-button'),
      });

      await triggerEvent(inputFile, 'change', { files: [file] });
      await fillByLabel(t('components.administration.create-attestations.label'), 'label', { exact: false });
      await fillByLabel(t('components.administration.create-attestations.template-key'), 'key', { exact: false });
      await fillByLabel(t('components.administration.create-attestations.template-name'), 'name', { exact: false });

      await click(submit);

      assert.ok(await screen.findByText(t('components.administration.create-attestations.notifications.success')));
    });
  });

  module('when not all fields are filled', function () {
    test('it should disable submit button if no file', async function (assert) {
      const screen = await render(
        <template><CreateAttestations /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
      );
      const submit = screen.getByRole('button', {
        name: t('components.administration.create-attestations.submit-button'),
      });

      await fillByLabel(t('components.administration.create-attestations.label'), 'label', { exact: false });
      await fillByLabel(t('components.administration.create-attestations.template-key'), 'key', { exact: false });
      await fillByLabel(t('components.administration.create-attestations.template-name'), 'name', { exact: false });

      assert.dom(submit).hasAttribute('aria-disabled');
    });

    test('it should disable submit button if no label, no key or no name', async function (assert) {
      const screen = await render(
        <template><CreateAttestations /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
      );

      const inputFile = screen.getByLabelText(t('components.administration.create-attestations.upload-button'));
      const submit = screen.getByRole('button', {
        name: t('components.administration.create-attestations.submit-button'),
      });

      await triggerEvent(inputFile, 'change', { files: [file] });

      assert.dom(submit).hasAttribute('aria-disabled');
    });
  });

  module('error cases', function () {
    [
      {
        name: 'payload is too large',
        status: 413,
        code: null,
        translationKey: 'components.administration.create-attestations.notifications.error.payload-too-large',
      },
      {
        name: 'S3 upload',
        status: null,
        code: 'S3_UPLOAD_ERROR',
        translationKey: 'components.administration.create-attestations.notifications.error.s3-upload-error',
      },
      {
        name: 'duplicate attestation key',
        status: null,
        code: 'DUPLICATE_ATTESTATION_KEY',
        translationKey: 'components.administration.create-attestations.notifications.error.duplicate-attestation-key',
      },
      {
        name: 'wrong file format',
        status: 400,
        code: 'WRONG_FILE_FORMAT',
        translationKey: 'components.administration.create-attestations.notifications.error.wrong-file-format',
      },
    ].forEach(({ name, status, code, translationKey }) => {
      test(`it should display ${name} error`, async function (assert) {
        // given
        requestManagerService.request.rejects({ errors: [{ status, code }] });

        const screen = await render(
          <template><CreateAttestations /><PixToastContainer @closeButtonAriaLabel="Close" /></template>,
        );

        const inputFile = screen.getByLabelText(t('components.administration.create-attestations.upload-button'));
        const submit = screen.getByRole('button', {
          name: t('components.administration.create-attestations.submit-button'),
        });

        await triggerEvent(inputFile, 'change', { files: [file] });
        await fillByLabel(t('components.administration.create-attestations.label'), 'label', { exact: false });
        await fillByLabel(t('components.administration.create-attestations.template-key'), 'key', { exact: false });
        await fillByLabel(t('components.administration.create-attestations.template-name'), 'name', { exact: false });

        await click(submit);
        assert.ok(await screen.findByText(t(translationKey)));
      });
    });
  });
});
