import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import StudentInformationForm from 'mon-pix/components/account-recovery/student-information-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | student-information-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render a account recovery student information form', async function (assert) {
    // given / when
    const screen = await render(<template><StudentInformationForm /></template>);

    // then
    assert.ok(
      screen.getByRole('heading', {
        name: t('pages.account-recovery.find-sco-record.student-information.title'),
      }),
    );
    assert.ok(screen.getByText('Si vous possédez un compte avec une adresse e-mail valide,'));
    assert.ok(
      screen.getByRole('link', {
        name: t('pages.account-recovery.find-sco-record.student-information.subtitle.link'),
      }),
    );
    assert.ok(screen.getByText(t('common.form.mandatory-all-fields')));
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

    const screen = await render(
      <template><StudentInformationForm @submitStudentInformation={{submitStudentInformation}} /></template>,
    );

    // when
    await fillIn(
      screen.getByLabelText(t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'), {
        exact: false,
      }),
      ine,
    );
    await fillIn(
      screen.getByLabelText(t('pages.account-recovery.find-sco-record.student-information.form.first-name'), {
        exact: false,
      }),
      firstName,
    );
    await fillIn(
      screen.getByLabelText(
        new RegExp(t('pages.account-recovery.find-sco-record.student-information.form.last-name')),
        {
          exact: false,
        },
      ),
      lastName,
    );
    await fillIn(
      screen.getByRole('spinbutton', {
        name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-day'),
      }),
      dayOfBirth,
    );
    await fillIn(
      screen.getByRole('spinbutton', {
        name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-month'),
      }),
      monthOfBirth,
    );
    await fillIn(
      screen.getByRole('spinbutton', {
        name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-year'),
      }),
      yearOfBirth,
    );
    await click(
      screen.getByRole('button', {
        name: t('pages.account-recovery.find-sco-record.student-information.form.submit'),
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
        const screen = await render(<template><StudentInformationForm /></template>);
        const ineInaInput = screen.getByLabelText(
          t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
          { exact: false },
        );

        // when
        await fillIn(ineInaInput, validIna);
        await triggerEvent(ineInaInput, 'focusout');

        // then
        assert.notOk(
          screen.queryByText(
            t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format'),
          ),
        );
      });

      test('should not display an error message on focus-out even if there are leading or trailing spaces', async function (assert) {
        // given
        const validIna = '  1234567890A  ';
        const screen = await render(<template><StudentInformationForm /></template>);
        const ineInaInput = screen.getByLabelText(
          t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
          { exact: false },
        );

        // when
        await fillIn(ineInaInput, validIna);
        await triggerEvent(ineInaInput, 'focusout');

        // then
        assert.notOk(
          screen.queryByText(
            t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format'),
          ),
        );
      });
    });

    module('when the user ine or ina is invalid', function () {
      test('should display an invalid format error message on focus-out', async function (assert) {
        // given
        const invalidIneIna = '123ABCDEF';
        const screen = await render(<template><StudentInformationForm /></template>);
        const ineInaInput = screen.getByLabelText(
          t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
          { exact: false },
        );

        // when
        await fillIn(ineInaInput, invalidIneIna);
        await triggerEvent(ineInaInput, 'focusout');

        // then
        assert.ok(
          screen.queryByText(
            t('pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format'),
          ),
        );
      });

      test('should display a required field error message on focus-out if ine field is empty', async function (assert) {
        // given
        const emptyIneIna = '     ';
        const screen = await render(<template><StudentInformationForm /></template>);
        const ineInaInput = screen.getByLabelText(
          t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
          { exact: false },
        );

        // when
        await fillIn(ineInaInput, emptyIneIna);
        await triggerEvent(ineInaInput, 'focusout');

        // then
        assert.ok(
          screen.getByText(t('pages.account-recovery.find-sco-record.student-information.errors.empty-ine-ina')),
        );
      });
    });
  });

  module('submit button', function () {
    test('should be disabled when the form is empty', async function (assert) {
      // given / when
      const screen = await render(<template><StudentInformationForm /></template>);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: t('pages.account-recovery.find-sco-record.student-information.form.submit'),
          }),
        )
        .hasAttribute('aria-disabled');
    });

    test('should stay disabled when some required fields are still empty', async function (assert) {
      // given
      const screen = await render(<template><StudentInformationForm /></template>);

      // when
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'), {
          exact: false,
        }),
        '1234567890A',
      );
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.find-sco-record.student-information.form.first-name'), {
          exact: false,
        }),
        'Gaston',
      );
      await fillIn(
        screen.getByLabelText(
          new RegExp(t('pages.account-recovery.find-sco-record.student-information.form.last-name')),
          { exact: false },
        ),
        'Lagaffe',
      );

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: t('pages.account-recovery.find-sco-record.student-information.form.submit'),
          }),
        )
        .hasAttribute('aria-disabled');
    });

    test('should stay disabled when the ine or ina is invalid', async function (assert) {
      // given
      const screen = await render(<template><StudentInformationForm /></template>);

      // when
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'), {
          exact: false,
        }),
        'ABCDE',
      );
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.find-sco-record.student-information.form.first-name'), {
          exact: false,
        }),
        'Gaston',
      );
      await fillIn(
        screen.getByLabelText(
          new RegExp(t('pages.account-recovery.find-sco-record.student-information.form.last-name')),
          { exact: false },
        ),
        'Lagaffe',
      );
      await fillIn(
        screen.getByRole('spinbutton', {
          name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-day'),
        }),
        15,
      );
      await fillIn(
        screen.getByRole('spinbutton', {
          name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-month'),
        }),
        5,
      );
      await fillIn(
        screen.getByRole('spinbutton', {
          name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-year'),
        }),
        2000,
      );

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: t('pages.account-recovery.find-sco-record.student-information.form.submit'),
          }),
        )
        .hasAttribute('aria-disabled');
    });

    test('should be enabled when every field is valid', async function (assert) {
      // given
      const screen = await render(<template><StudentInformationForm /></template>);

      // when
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'), {
          exact: false,
        }),
        '123456789BB',
      );
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.find-sco-record.student-information.form.first-name'), {
          exact: false,
        }),
        'Gaston',
      );
      await fillIn(
        screen.getByLabelText(
          new RegExp(t('pages.account-recovery.find-sco-record.student-information.form.last-name')),
          { exact: false },
        ),
        'Lagaffe',
      );
      await fillIn(
        screen.getByRole('spinbutton', {
          name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-day'),
        }),
        15,
      );
      await fillIn(
        screen.getByRole('spinbutton', {
          name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-month'),
        }),
        5,
      );
      await fillIn(
        screen.getByRole('spinbutton', {
          name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-year'),
        }),
        2000,
      );

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: t('pages.account-recovery.find-sco-record.student-information.form.submit'),
          }),
        )
        .doesNotHaveAttribute('aria-disabled');
    });

    test('should format a single-digit birthdate before submitting', async function (assert) {
      // given
      const submitStudentInformation = sinon.stub();
      submitStudentInformation.resolves();

      const screen = await render(
        <template><StudentInformationForm @submitStudentInformation={{submitStudentInformation}} /></template>,
      );

      // when
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'), {
          exact: false,
        }),
        '123456789BB',
      );
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.find-sco-record.student-information.form.first-name'), {
          exact: false,
        }),
        'Gaston',
      );
      await fillIn(
        screen.getByLabelText(
          new RegExp(t('pages.account-recovery.find-sco-record.student-information.form.last-name')),
          { exact: false },
        ),
        'Lagaffe',
      );
      await fillIn(
        screen.getByRole('spinbutton', {
          name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-day'),
        }),
        2,
      );
      await fillIn(
        screen.getByRole('spinbutton', {
          name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-month'),
        }),
        5,
      );
      await fillIn(
        screen.getByRole('spinbutton', {
          name: t('pages.account-recovery.find-sco-record.student-information.form.label.birth-year'),
        }),
        2004,
      );
      await click(
        screen.getByRole('button', {
          name: t('pages.account-recovery.find-sco-record.student-information.form.submit'),
        }),
      );

      // then
      sinon.assert.calledWithExactly(submitStudentInformation, {
        ineIna: '123456789BB',
        firstName: 'Gaston',
        lastName: 'Lagaffe',
        birthdate: '2004-05-02',
      });
      assert.ok(true);
    });
  });

  module('last name field', function () {
    test('should display a required field error message on focus-out if last name field is empty', async function (assert) {
      // given
      const emptyLastName = '     ';
      const screen = await render(<template><StudentInformationForm /></template>);
      const lastNameInput = screen.getByLabelText(
        new RegExp(t('pages.account-recovery.find-sco-record.student-information.form.last-name')),
        { exact: false },
      );

      // when
      await fillIn(lastNameInput, emptyLastName);
      await triggerEvent(lastNameInput, 'focusout');

      // then
      assert.ok(
        screen.getByText(t('pages.account-recovery.find-sco-record.student-information.errors.empty-last-name')),
      );
    });
  });

  module('first name field', function () {
    test('should display a required field error message on focus-out if first name field is empty', async function (assert) {
      // given
      const emptyFirstName = '     ';
      const screen = await render(<template><StudentInformationForm /></template>);
      const firstNameInput = screen.getByLabelText(
        t('pages.account-recovery.find-sco-record.student-information.form.first-name'),
        { exact: false },
      );

      // when
      await fillIn(firstNameInput, emptyFirstName);
      await triggerEvent(firstNameInput, 'focusout');

      // then
      assert.ok(
        screen.getByText(t('pages.account-recovery.find-sco-record.student-information.errors.empty-first-name')),
      );
    });
  });
});
