import { clickByName, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import ExternalId from '../../../../../app/components/campaign/create-form/external-id.gjs';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::ExternalId', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    data.campaign = store.createRecord('campaign');
    data.errors = {};
  });

  test('it fills external user ID selection (yes)', async function (assert) {
    // given
    data.campaign.externalIdLabel = 'Numéro étudiant';

    // when
    const screen = await render(
      <template><ExternalId @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // then
    const element = screen.getByRole('radio', { name: t('pages.campaign-creation.yes') });
    assert.dom(element).isChecked();
    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.external-id-label.label'), { exact: false }))
      .hasValue('Numéro étudiant');
  });

  test('it fills external user ID selection (no) by default', async function (assert) {
    // given
    data.campaign.externalIdLabel = null;

    // when
    const screen = await render(
      <template><ExternalId @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // then
    const element = screen.getByRole('radio', { name: t('pages.campaign-creation.no') });
    assert.dom(element).isChecked();
  });

  test('it display explanation information', async function (assert) {
    // when
    const screen = await render(
      <template><ExternalId @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // then
    assert.dom(screen.getByText(t('pages.campaign-creation.external-id-label.information.label'))).exists();
    const informationMessageParts = t('pages.campaign-creation.external-id-label.information.message').split('<br>');
    for (const part of informationMessageParts) {
      assert.dom(screen.getByText(part, { exact: false })).exists();
    }
  });

  test('it not displays external id type nor gdpr footnote by default', async function (assert) {
    // when
    const screen = await render(
      <template><ExternalId @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // then
    assert
      .dom(screen.queryByRole('radiogroup', { name: t('pages.campaign-creation.external-id-type.question-label') }))
      .doesNotExist();
    assert.dom(screen.queryByText(t('pages.campaign-creation.legal-warning'))).doesNotExist();
  });

  test('it displays external id type and gdpr footnote once the user asks for an external id', async function (assert) {
    // given
    const screen = await render(
      <template><ExternalId @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // when
    await clickByName(t('pages.campaign-creation.yes'));

    // then
    assert
      .dom(screen.getByRole('radiogroup', { name: t('pages.campaign-creation.external-id-type.question-label') }))
      .exists();
    assert.dom(screen.getByText(t('pages.campaign-creation.legal-warning'))).exists();
  });

  test('it clears the external id label and type when the user declines', async function (assert) {
    // given
    data.campaign.externalIdLabel = 'Numéro étudiant';
    data.campaign.externalIdType = 'EMAIL';

    const screen = await render(
      <template><ExternalId @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // when
    await clickByName(t('pages.campaign-creation.no'));

    // then
    assert.strictEqual(data.campaign.externalIdLabel, null);
    assert.strictEqual(data.campaign.externalIdType, '');
    assert.dom(screen.queryByText(t('pages.campaign-creation.legal-warning'))).doesNotExist();
  });

  test('it updates campaign model when select a type', async function (assert) {
    // given
    const screen = await render(
      <template><ExternalId @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );
    await clickByName(t('pages.campaign-creation.yes'));

    // when
    await screen.getByLabelText(t('pages.campaign-settings.external-user-id-types.email')).click();

    // then
    assert.strictEqual(data.campaign.externalIdType, 'EMAIL');
  });

  test('it displays errors messages for external id type and label', async function (assert) {
    // given
    const campaignWithErrors = EmberObject.create({
      errors: {
        externalIdLabel: [{ message: 'EXTERNAL_USER_ID_IS_REQUIRED' }],
      },
    });
    data.errors = campaignWithErrors.errors;

    // when
    const screen = await render(
      <template><ExternalId @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );
    await clickByName(t('pages.campaign-creation.yes'));

    // then
    assert.dom(screen.getByText(t('api-error-messages.campaign-creation.external-user-id-required'))).exists();
  });
});
