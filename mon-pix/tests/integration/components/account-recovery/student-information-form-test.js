import { module, test } from 'qunit';
import Service from '@ember/service';
import { render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { contains } from '../../../helpers/contains';
import sinon from 'sinon';
import { fillInByLabel } from '../../../helpers/fill-in-by-label';
import { clickByLabel } from '../../../helpers/click-by-label';

module('Integration | Component | student-information-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render a account recovery student information form', async function (assert) {
    // given / when
    await render(hbs`<AccountRecovery::StudentInformationForm />`);

    // then
    assert.ok(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title')));
    assert.ok(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.subtitle.text')));
    assert.ok(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.subtitle.link')));
    assert.ok(contains(this.intl.t('common.form.mandatory-all-fields')));
  });

  test('should enable submission on account recovery form', async function (assert) {
    // given
    const ine = '0123456789A';
    const firstName = 'Manuela';
    const lastName = 'Lecol';
    const dayOfBirth = 20;
    const monthOfBirth = 5;
    const yearOfBirth = 2000;

    const createRecordStub = sinon.stub();
    class StoreStubService extends Service {
      createRecord = createRecordStub;
    }
    this.owner.register('service:store', StoreStubService);
    const submitStudentInformation = sinon.stub();
    submitStudentInformation.resolves();
    this.set('submitStudentInformation', submitStudentInformation);

    await render(hbs`
      <AccountRecovery::StudentInformationForm
        @submitStudentInformation={{this.submitStudentInformation}}
      />
    `);

    // when
    await fillInByLabel(this.intl.t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'), ine);
    await fillInByLabel(
      this.intl.t('pages.account-recovery.find-sco-record.student-information.form.first-name'),
      firstName
    );
    await fillInByLabel(
      this.intl.t('pages.account-recovery.find-sco-record.student-information.form.last-name'),
      lastName
    );
    await fillInByLabel(
      this.intl.t('pages.account-recovery.find-sco-record.student-information.form.label.birth-day'),
      dayOfBirth
    );
    await fillInByLabel(
      this.intl.t('pages.account-recovery.find-sco-record.student-information.form.label.birth-month'),
      monthOfBirth
    );
    await fillInByLabel(
      this.intl.t('pages.account-recovery.find-sco-record.student-information.form.label.birth-year'),
      yearOfBirth
    );
    await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.student-information.form.submit'));

    // then
    sinon.assert.calledWithExactly(submitStudentInformation, {
      ineIna: ine,
      firstName,
      lastName,
      birthdate: '2000-05-20',
    });
    assert.ok(true);
  });

  module('ine field', function () {
    module('when the user fill in ine field with valid ina or ine', function () {
      test('should not display an error message on focus-out', async function (assert) {
        // given
        const validIna = '1234567890A';
        await render(hbs`<AccountRecovery::StudentInformationForm />`);

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
          validIna
        );
        await triggerEvent('#ineIna', 'focusout');

        // then
        assert.notOk(
          contains(
            this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format')
          )
        );
      });

      test('should not display an error message on focus-out even if there are leading or trailing spaces', async function (assert) {
        // given
        const validIna = '  1234567890A  ';
        await render(hbs`<AccountRecovery::StudentInformationForm />`);

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
          validIna
        );
        await triggerEvent('#ineIna', 'focusout');

        // then
        assert.notOk(
          contains(
            this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format')
          )
        );
      });
    });

    module('when the user ine or ina is invalid', function () {
      test('should display an invalid format error message on focus-out', async function (assert) {
        // given
        const invalidIneIna = '123ABCDEF';
        await render(hbs`<AccountRecovery::StudentInformationForm />`);

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
          invalidIneIna
        );
        await triggerEvent('#ineIna', 'focusout');

        // then
        assert.ok(
          contains(
            this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format')
          )
        );
      });

      test('should display a required field error message on focus-out if ine field is empty', async function (assert) {
        // given
        const emptyIneIna = '     ';
        await render(hbs`<AccountRecovery::StudentInformationForm />`);

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
          emptyIneIna
        );
        await triggerEvent('#ineIna', 'focusout');

        // then
        assert.ok(
          contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.empty-ine-ina'))
        );
      });
    });
  });

  module('last name field', function () {
    test('should display a required field error message on focus-out if last name field is empty', async function (assert) {
      // given
      const emptyLastName = '     ';
      await render(hbs`<AccountRecovery::StudentInformationForm />`);

      // when
      await fillInByLabel(
        this.intl.t('pages.account-recovery.find-sco-record.student-information.form.last-name'),
        emptyLastName
      );
      await triggerEvent('#lastName', 'focusout');

      // then
      assert.ok(
        contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.empty-last-name'))
      );
    });
  });

  module('first name field', function () {
    test('should display a required field error message on focus-out if first name field is empty', async function (assert) {
      // given
      const emptyFirstName = '     ';
      await render(hbs`<AccountRecovery::StudentInformationForm />`);

      // when
      await fillInByLabel(
        this.intl.t('pages.account-recovery.find-sco-record.student-information.form.last-name'),
        emptyFirstName
      );
      await triggerEvent('#firstName', 'focusout');

      // then
      assert.ok(
        contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.empty-first-name'))
      );
    });
  });
});
