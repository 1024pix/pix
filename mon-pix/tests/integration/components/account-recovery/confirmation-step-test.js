import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { clickByLabel } from '../../../helpers/click-by-label';
import sinon from 'sinon';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | confirmation-step', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render account recovery confirmation step', async function (assert) {
    // given
    const studentInformationForAccountRecovery = EmberObject.create({
      firstName: 'Philippe',
      lastName: 'Auguste',
      username: 'Philippe.auguste2312',
      email: 'philippe.auguste@example.net',
      latestOrganizationName: 'Collège George-Besse, Loches',
    });
    this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);

    // when
    await render(hbs`<AccountRecovery::ConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
    />`);

    // then
    assert.ok(
      contains(
        this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName: 'Philippe' })
      )
    );
    assert.ok(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.found-account')));
    assert.ok(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.contact-support')));
    assert.ok(contains('Auguste'));
    assert.ok(contains('Philippe'));
    assert.ok(contains('Philippe.auguste2312'));
    assert.ok(contains('Collège George-Besse, Loches'));
    assert.ok(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account')));
  });

  module('when user does not have a username', function () {
    test('should not display username', async function (assert) {
      // given
      const studentInformationForAccountRecovery = EmberObject.create({
        firstName: 'Philippe',
        lastName: 'Auguste',
        email: 'philippe.auguste@example.net',
        latestOrganizationName: 'Collège George-Besse, Loches',
      });
      this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);

      // when
      await render(hbs`<AccountRecovery::ConfirmationStep
        @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      />`);

      // then
      assert.notOk(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.fields.username')));
    });
  });

  test('should be possible to cancel the account recovery process', async function (assert) {
    // given
    const studentInformationForAccountRecovery = EmberObject.create({
      firstName: 'Philippe',
      lastName: 'Auguste',
      username: 'Philippe.auguste2312',
      email: 'philippe.auguste@example.net',
      latestOrganizationName: 'Collège George-Besse, Loches',
    });
    this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);
    const cancelAccountRecovery = sinon.stub();
    this.set('cancelAccountRecovery', cancelAccountRecovery);

    // when
    await render(hbs`<AccountRecovery::ConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      @cancelAccountRecovery={{this.cancelAccountRecovery}}
    />`);
    await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.cancel'));

    // then
    sinon.assert.calledOnce(cancelAccountRecovery);
    assert.ok(true);
  });

  test('should not be possible to continue the account recovery process when have not checked to certify', async function (assert) {
    // given
    const studentInformationForAccountRecovery = EmberObject.create({
      firstName: 'Philippe',
      lastName: 'Auguste',
      username: 'Philippe.auguste2312',
      email: 'philippe.auguste@example.net',
      latestOrganizationName: 'Collège George-Besse, Loches',
    });
    this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);
    const continueAccountRecoveryBackupEmailConfirmation = sinon.stub();
    this.set('continueAccountRecoveryBackupEmailConfirmation', continueAccountRecoveryBackupEmailConfirmation);

    // when
    const screen = await render(hbs`<AccountRecovery::ConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      @continueAccountRecoveryBackupEmailConfirmation={{this.continueAccountRecoveryBackupEmailConfirmation}}
    />`);

    // then
    const confirmButton = screen.getByRole('button', {
      name: this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm'),
    });
    assert.ok(confirmButton);
    assert.true(confirmButton.disabled);
  });

  test('should be possible to continue the account recovery process', async function (assert) {
    // given
    const studentInformationForAccountRecovery = EmberObject.create({
      firstName: 'Philippe',
      lastName: 'Auguste',
      username: 'Philippe.auguste2312',
      email: 'philippe.auguste@example.net',
      latestOrganizationName: 'Collège George-Besse, Loches',
    });
    this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);
    const continueAccountRecoveryBackupEmailConfirmation = sinon.stub();
    this.set('continueAccountRecoveryBackupEmailConfirmation', continueAccountRecoveryBackupEmailConfirmation);

    // when
    const screen = await render(hbs`<AccountRecovery::ConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      @continueAccountRecoveryBackupEmailConfirmation={{this.continueAccountRecoveryBackupEmailConfirmation}}
    />`);
    await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account'));
    await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm'));

    // then
    sinon.assert.calledOnce(continueAccountRecoveryBackupEmailConfirmation);
    assert.ok(true);
  });
});
