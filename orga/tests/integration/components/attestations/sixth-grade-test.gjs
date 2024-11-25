import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import SixthGrade from 'pix-orga/components/attestations/sixth-grade';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Attestations | Sixth-grade', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display all basics informations', async function (assert) {
    // given
    const onSubmit = sinon.stub();
    const divisions = [];

    // when
    const screen = await render(<template><SixthGrade @divisions={{divisions}} @onSubmit={{onSubmit}} /></template>);
    // then
    assert.ok(screen.getByRole('heading', { name: t('pages.attestations.title') }));
    assert.ok(screen.getByText(t('pages.attestations.description')));
    assert.ok(screen.getByRole('textbox', { name: t('pages.attestations.select-label') }));
    assert.ok(screen.getByPlaceholderText(t('pages.attestations.placeholder')));
    assert.ok(screen.getByRole('button', { name: t('pages.attestations.download-attestations-button') }));
  });

  test('download button is disabled if there is no selected divisions', async function (assert) {
    // given
    const onSubmit = sinon.stub();
    const divisions = [];

    // when
    const screen = await render(<template><SixthGrade @divisions={{divisions}} @onSubmit={{onSubmit}} /></template>);

    // then
    const downloadButton = await screen.getByRole('button', {
      name: t('pages.attestations.download-attestations-button'),
    });
    assert.dom(downloadButton).isDisabled();
  });

  test('it should call onSubmit action with selected divisions', async function (assert) {
    // given
    const onSubmit = sinon.stub();

    const divisions = [{ label: 'division1', value: 'division1' }];

    // when
    const screen = await render(<template><SixthGrade @divisions={{divisions}} @onSubmit={{onSubmit}} /></template>);

    const multiSelect = await screen.getByRole('textbox', { name: t('pages.attestations.select-label') });
    await click(multiSelect);

    const firstDivisionOption = await screen.findByRole('checkbox', { name: 'division1' });
    await click(firstDivisionOption);

    const downloadButton = await screen.getByRole('button', {
      name: t('pages.attestations.download-attestations-button'),
    });

    // we need to get out of input choice to click on download button, so we have to click again on the multiselect to close it
    await click(multiSelect);
    await click(downloadButton);

    // then
    sinon.assert.calledWithExactly(onSubmit, ['division1']);
    assert.ok(true);
  });
});
