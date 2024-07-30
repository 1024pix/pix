import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | student-information-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render a account recovery student information form', async function (assert) {
    // given / when
    const screen = await render(hbs`<AccountRecovery::StudentInformationForm />`);

    // then
    assert.ok(
      screen.getByRole('heading', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.title'),
      }),
    );
    assert.ok(screen.getByText('Si vous possédez un compte avec une adresse e-mail valide,'));
    assert.ok(
      screen.getByRole('link', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.subtitle.link'),
      }),
    );
    assert.ok(screen.getByText(this.intl.t('common.form.mandatory-all-fields')));
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

    const screen = await render(
      hbs`<AccountRecovery::StudentInformationForm @submitStudentInformation={{this.submitStudentInformation}} />`,
    );

    // when
    await fillIn(
      screen.getByRole('textbox', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
      }),
      ine,
    );
    await fillIn(
      screen.getByRole('textbox', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.first-name'),
      }),
      firstName,
    );
    await fillIn(
      screen.getByRole('textbox', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.last-name'),
      }),
      lastName,
    );
    await fillIn(
      screen.getByRole('spinbutton', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.label.birth-day'),
      }),
      dayOfBirth,
    );
    await fillIn(
      screen.getByRole('spinbutton', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.label.birth-month'),
      }),
      monthOfBirth,
    );
    await fillIn(
      screen.getByRole('spinbutton', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.label.birth-year'),
      }),
      yearOfBirth,
    );
    await click(
      screen.getByRole('button', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.submit'),
      }),
    );

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
        const screen = await render(hbs`<AccountRecovery::StudentInformationForm />`);
        const ineInaInput = screen.getByRole('textbox', {
          name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
        });

        // when
        await fillIn(ineInaInput, validIna);
        await triggerEvent(ineInaInput, 'focusout');

        // then
        assert.notOk(
          screen.queryByText(
            this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format'),
          ),
        );
      });

      test('should not display an error message on focus-out even if there are leading or trailing spaces', async function (assert) {
        // given
        const validIna = '  1234567890A  ';
        const screen = await render(hbs`<AccountRecovery::StudentInformationForm />`);
        const ineInaInput = screen.getByRole('textbox', {
          name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
        });

        // when
        await fillIn(ineInaInput, validIna);
        await triggerEvent(ineInaInput, 'focusout');

        // then
        assert.notOk(
          screen.queryByText(
            this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format'),
          ),
        );
      });
    });

    module('when the user ine or ina is invalid', function () {
      test('should display an invalid format error message on focus-out', async function (assert) {
        // given
        const invalidIneIna = '123ABCDEF';
        const screen = await render(hbs`<AccountRecovery::StudentInformationForm />`);
        const ineInaInput = screen.getByRole('textbox', {
          name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
        });

        // when
        await fillIn(ineInaInput, invalidIneIna);
        await triggerEvent(ineInaInput, 'focusout');

        // then
        assert.ok(
          screen.queryByText(
            this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format'),
          ),
        );
      });

      test('should display a required field error message on focus-out if ine field is empty', async function (assert) {
        // given
        const emptyIneIna = '     ';
        const screen = await render(hbs`<AccountRecovery::StudentInformationForm />`);
        const ineInaInput = screen.getByRole('textbox', {
          name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
        });

        // when
        await fillIn(ineInaInput, emptyIneIna);
        await triggerEvent(ineInaInput, 'focusout');

        // then
        assert.ok(
          screen.getByText(
            this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.empty-ine-ina'),
          ),
        );
      });
    });
  });

  module('last name field', function () {
    test('should display a required field error message on focus-out if last name field is empty', async function (assert) {
      // given
      const emptyLastName = '     ';
      const screen = await render(hbs`<AccountRecovery::StudentInformationForm />`);
      const lastNameInput = screen.getByRole('textbox', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.last-name'),
      });

      // when
      await fillIn(lastNameInput, emptyLastName);
      await triggerEvent(lastNameInput, 'focusout');

      // then
      assert.ok(
        screen.getByText(
          this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.empty-last-name'),
        ),
      );
    });
  });

  module('first name field', function () {
    test('should display a required field error message on focus-out if first name field is empty', async function (assert) {
      // given
      const emptyFirstName = '     ';
      const screen = await render(hbs`<AccountRecovery::StudentInformationForm />`);
      const firstNameInput = screen.getByRole('textbox', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.form.first-name'),
      });

      // when
      await fillIn(firstNameInput, emptyFirstName);
      await triggerEvent(firstNameInput, 'focusout');

      // then
      assert.ok(
        screen.getByText(
          this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.empty-first-name'),
        ),
      );
    });
  });
});
