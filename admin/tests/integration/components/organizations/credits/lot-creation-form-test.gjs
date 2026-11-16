import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import LotCreationForm from 'pix-admin/components/organizations/credits/lot-creation-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/credits/lot-creation-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  const labels = () => ({
    count: t('components.organizations.credits.creation.labels.count'),
    activationDate: t('components.organizations.credits.creation.labels.activation-date'),
    expirationDate: t('components.organizations.credits.creation.labels.expiration-date'),
    reference: t('components.organizations.credits.creation.labels.reference'),
  });

  test('it submits the filled lot', async function (assert) {
    // given
    const onSubmit = sinon.stub();
    const LABELS = labels();
    const screen = await render(<template><LotCreationForm @onSubmit={{onSubmit}} /></template>);

    // when
    await fillIn(screen.getByLabelText(LABELS.count, { exact: false }), 50);
    await fillIn(screen.getByLabelText(LABELS.activationDate, { exact: false }), '2026-01-01');
    await fillIn(screen.getByLabelText(LABELS.expirationDate, { exact: false }), '2026-12-31');
    await fillIn(screen.getByLabelText(LABELS.reference, { exact: false }), 'CONV-2026-042');
    await click(screen.getByRole('button', { name: t('common.actions.add') }));

    // then
    assert.true(
      onSubmit.calledWithExactly({
        count: '50',
        activationDate: '2026-01-01',
        expirationDate: '2026-12-31',
        reference: 'CONV-2026-042',
      }),
    );
  });

  test('it reports every empty mandatory field at once', async function (assert) {
    // given
    const onSubmit = sinon.stub();
    const screen = await render(<template><LotCreationForm @onSubmit={{onSubmit}} /></template>);

    // when
    await click(screen.getByRole('button', { name: t('common.actions.add') }));

    // then
    assert.dom(screen.getByText(t('components.organizations.credits.creation.error-messages.count'))).exists();
    assert
      .dom(screen.getByText(t('components.organizations.credits.creation.error-messages.expiration-date')))
      .exists();
    assert.dom(screen.getByText(t('components.organizations.credits.creation.error-messages.reference'))).exists();
    assert.true(onSubmit.notCalled);
  });

  test('it refuses an expiration date that is not after the activation date', async function (assert) {
    // given
    const onSubmit = sinon.stub();
    const LABELS = labels();
    const screen = await render(<template><LotCreationForm @onSubmit={{onSubmit}} /></template>);

    // when
    await fillIn(screen.getByLabelText(LABELS.count, { exact: false }), 50);
    await fillIn(screen.getByLabelText(LABELS.activationDate, { exact: false }), '2026-06-01');
    await fillIn(screen.getByLabelText(LABELS.expirationDate, { exact: false }), '2026-06-01');
    await fillIn(screen.getByLabelText(LABELS.reference, { exact: false }), 'CONV-2026-042');
    await click(screen.getByRole('button', { name: t('common.actions.add') }));

    // then
    assert
      .dom(screen.getByText(t('components.organizations.credits.creation.error-messages.expiration-date-too-early')))
      .exists();
    assert.true(onSubmit.notCalled);
  });
});
