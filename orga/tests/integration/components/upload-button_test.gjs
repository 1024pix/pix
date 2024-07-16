import { render } from '@1024pix/ember-testing-library';
import { triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import UploadButton from 'pix-orga/components/upload-button';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | UploadButton', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should be disabled', async function (assert) {
    // given
    const supportedFormats = ['.csv'];
    const onChangeHandler = sinon.spy();
    // when
    const screen = await render(
      <template>
        <UploadButton
          @id="students-file-upload"
          @size="small"
          @disabled={{true}}
          @onChange={{onChangeHandler}}
          @supportedFormats={{supportedFormats}}
        >
          label
        </UploadButton>
      </template>,
    );

    // then
    const button = screen.getByRole('button', { name: 'label' });
    assert.ok(button.hasAttribute('disabled'));
  });
  test('it should call onChange spy when file selected', async function (assert) {
    // given
    const supportedFormats = ['.csv'];
    const onChangeHandler = sinon.spy();
    // when
    const screen = await render(
      <template>
        <UploadButton
          @id="input-id"
          @size="small"
          @disabled={{false}}
          @onChange={{onChangeHandler}}
          @supportedFormats={{supportedFormats}}
        >
          label
        </UploadButton>
      </template>,
    );

    // then
    const input = screen.getByLabelText('label');
    const file = new Blob(['foo'], { type: 'valid-file' });
    await triggerEvent(input, 'change', { files: [file] });
    assert.ok(onChangeHandler.calledWithExactly([file]));
  });
  test('it should have correct attributes', async function (assert) {
    // given
    const supportedFormats = ['.csv', '.xml'];
    const onChangeHandler = sinon.spy();
    const separator = t('pages.organization-participants-import.file-type-separator');
    // when
    const screen = await render(
      <template>
        <UploadButton
          @id="input-id"
          @size="small"
          @disabled={{false}}
          @onChange={{onChangeHandler}}
          @supportedFormats={{supportedFormats}}
        >
          label
        </UploadButton>
      </template>,
    );

    // then
    const input = screen.getByLabelText('label');
    assert.strictEqual(input.getAttribute('id'), 'input-id');
    assert.strictEqual(input.getAttribute('accept'), '.csv,.xml');
    assert.ok(
      screen.getByText(
        t('pages.organization-participants-import.supported-formats', {
          types: supportedFormats.join(separator),
        }),
      ),
    );
  });
});
