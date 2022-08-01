import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { clickByLabel } from '../../../helpers/click-by-label';
import findByLabel from '../../../helpers/find-by-label';
import sinon from 'sinon';

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
    assert
      .dom(
        contains(
          this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName: 'Philippe' })
        )
      )
      .exists();
    assert
      .dom(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.found-account')))
      .exists();
    assert
      .dom(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.contact-support')))
      .exists();
    assert.dom(contains('Auguste'));
    assert.dom(contains('Philippe'));
    assert.dom(contains('Philippe.auguste2312'));
    assert.dom(contains('Collège George-Besse, Loches'));
    assert
      .dom(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account')))
      .exists();
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
      assert
        .dom(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.fields.username')))
        .doesNotExist();
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
    assert.expect(0);
    sinon.assert.calledOnce(cancelAccountRecovery);
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
    await render(hbs`<AccountRecovery::ConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      @continueAccountRecoveryBackupEmailConfirmation={{this.continueAccountRecoveryBackupEmailConfirmation}}
    />`);

    // then
    const confirmButton = findByLabel(
      this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm')
    );
    assert.dom(confirmButton).exists();
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
    await render(hbs`<AccountRecovery::ConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      @continueAccountRecoveryBackupEmailConfirmation={{this.continueAccountRecoveryBackupEmailConfirmation}}
    />`);
    await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account'));
    await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm'));

    // then
    assert.expect(0);
    sinon.assert.calledOnce(continueAccountRecoveryBackupEmailConfirmation);
  });
});
