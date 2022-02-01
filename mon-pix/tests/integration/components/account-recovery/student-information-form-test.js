import { expect } from 'chai';
import { describe, it } from 'mocha';
import Service from '@ember/service';
import { render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { contains } from '../../../helpers/contains';
import sinon from 'sinon';
import { fillInByLabel } from '../../../helpers/fill-in-by-label';
import { clickByLabel } from '../../../helpers/click-by-label';

describe('Integration | Component | student-information-form', function () {
  setupIntlRenderingTest();

  it('should render a account recovery student information form', async function () {
    // given / when
    await render(hbs`<AccountRecovery::StudentInformationForm />`);

    // then
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.subtitle.text'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.subtitle.link'))).to.exist;
    expect(contains(this.intl.t('common.form.mandatory-all-fields'))).to.exist;
  });

  it('should enable submission on account recovery form', async function () {
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
  });

  context('ine field', function () {
    context('when the user fill in ine field with valid ina or ine', function () {
      it('should not display an error message on focus-out', async function () {
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
        expect(
          contains(
            this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format')
          )
        ).to.not.exist;
      });

      it('should not display an error message on focus-out even if there are leading or trailing spaces', async function () {
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
        expect(
          contains(
            this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format')
          )
        ).to.not.exist;
      });
    });

    context('when the user ine or ina is invalid', function () {
      it('should display an invalid format error message on focus-out', async function () {
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
        expect(
          contains(
            this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format')
          )
        ).to.exist;
      });

      it('should display a required field error message on focus-out if ine field is empty', async function () {
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
        expect(
          contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.empty-ine-ina'))
        ).to.exist;
      });
    });
  });

  context('last name field', function () {
    it('should display a required field error message on focus-out if last name field is empty', async function () {
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
      expect(
        contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.empty-last-name'))
      ).to.exist;
    });
  });

  context('first name field', function () {
    it('should display a required field error message on focus-out if first name field is empty', async function () {
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
      expect(
        contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.empty-first-name'))
      ).to.exist;
    });
  });
});
