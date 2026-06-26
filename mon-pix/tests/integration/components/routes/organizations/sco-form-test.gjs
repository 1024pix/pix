import { render } from '@1024pix/ember-testing-library';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ScoForm from 'mon-pix/components/routes/organizations/sco-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const FIRSTNAME_LABEL = 'Prénom';
const LASTNAME_LABEL = 'Nom';
const DAY_LABEL = 'jour de naissance';
const MONTH_LABEL = 'mois de naissance';
const YEAR_LABEL = 'année de naissance';

async function fillForm({ screen, firstName, lastName, day, month, year }) {
  await fillIn(screen.getByRole('textbox', { name: FIRSTNAME_LABEL }), firstName);
  await fillIn(screen.getByRole('textbox', { name: LASTNAME_LABEL }), lastName);
  await fillIn(screen.getByRole('spinbutton', { name: DAY_LABEL }), day);
  await fillIn(screen.getByRole('spinbutton', { name: MONTH_LABEL }), month);
  await fillIn(screen.getByRole('spinbutton', { name: YEAR_LABEL }), year);
}

module('Integration | Component | routes/organizations/sco-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the rgpd legal notice', async function (assert) {
    // given & when
    const screen = await render(<template><ScoForm /></template>);

    // then
    assert.ok(screen.getByText(t('pages.join.rgpd-legal-notice')));
    assert.ok(screen.getByRole('link', { name: t('pages.join.rgpd-legal-notice-link') }));
  });

  module('dayOfBirth validation', function () {
    ['', ' ', '32', '0', '444', 'ee'].forEach(function (wrongDayOfBirth) {
      test(`should display an error when dayOfBirth is "${wrongDayOfBirth}"`, async function (assert) {
        // given
        const screen = await render(<template><ScoForm /></template>);
        const dayInput = screen.getByRole('spinbutton', { name: DAY_LABEL });

        // when
        await fillIn(dayInput, wrongDayOfBirth);
        await triggerEvent(dayInput, 'focusout');

        // then
        assert.dom(screen.getByText(t('pages.join.fields.birthdate.day-error'))).exists();
      });
    });

    ['1', '01', '31'].forEach(function (validDayOfBirth) {
      test(`should not display an error when dayOfBirth is "${validDayOfBirth}"`, async function (assert) {
        // given
        const screen = await render(<template><ScoForm /></template>);
        const dayInput = screen.getByRole('spinbutton', { name: DAY_LABEL });

        // when
        await fillIn(dayInput, validDayOfBirth);
        await triggerEvent(dayInput, 'focusout');

        // then
        assert.dom(screen.queryByText(t('pages.join.fields.birthdate.day-error'))).doesNotExist();
      });
    });
  });

  module('monthOfBirth validation', function () {
    ['', ' ', '13', '0', '444', 'ee'].forEach(function (wrongMonthOfBirth) {
      test(`should display an error when monthOfBirth is "${wrongMonthOfBirth}"`, async function (assert) {
        // given
        const screen = await render(<template><ScoForm /></template>);
        const monthInput = screen.getByRole('spinbutton', { name: MONTH_LABEL });

        // when
        await fillIn(monthInput, wrongMonthOfBirth);
        await triggerEvent(monthInput, 'focusout');

        // then
        assert.dom(screen.getByText(t('pages.join.fields.birthdate.month-error'))).exists();
      });
    });

    ['1', '01', '12'].forEach(function (validMonthOfBirth) {
      test(`should not display an error when monthOfBirth is "${validMonthOfBirth}"`, async function (assert) {
        // given
        const screen = await render(<template><ScoForm /></template>);
        const monthInput = screen.getByRole('spinbutton', { name: MONTH_LABEL });

        // when
        await fillIn(monthInput, validMonthOfBirth);
        await triggerEvent(monthInput, 'focusout');

        // then
        assert.dom(screen.queryByText(t('pages.join.fields.birthdate.month-error'))).doesNotExist();
      });
    });
  });

  module('yearOfBirth validation', function () {
    ['', ' ', '1', '11', '100', '0000', '0001', '0011', '0111', '10000'].forEach(function (wrongYearOfBirth) {
      test(`should display an error when yearOfBirth is "${wrongYearOfBirth}"`, async function (assert) {
        // given
        const screen = await render(<template><ScoForm /></template>);
        const yearInput = screen.getByRole('spinbutton', { name: YEAR_LABEL });

        // when
        await fillIn(yearInput, wrongYearOfBirth);
        await triggerEvent(yearInput, 'focusout');

        // then
        assert.dom(screen.getByText(t('pages.join.fields.birthdate.year-error'))).exists();
      });
    });

    ['1000', '9999'].forEach(function (validYearOfBirth) {
      test(`should not display an error when yearOfBirth is "${validYearOfBirth}"`, async function (assert) {
        // given
        const screen = await render(<template><ScoForm /></template>);
        const yearInput = screen.getByRole('spinbutton', { name: YEAR_LABEL });

        // when
        await fillIn(yearInput, validYearOfBirth);
        await triggerEvent(yearInput, 'focusout');

        // then
        assert.dom(screen.queryByText(t('pages.join.fields.birthdate.year-error'))).doesNotExist();
      });
    });
  });

  module('firstName validation', function () {
    ['', ' '].forEach(function (wrongString) {
      test(`should display an error when firstName is "${wrongString}"`, async function (assert) {
        // given
        const screen = await render(<template><ScoForm /></template>);
        const firstNameInput = screen.getByRole('textbox', { name: FIRSTNAME_LABEL });

        // when
        await fillIn(firstNameInput, wrongString);
        await triggerEvent(firstNameInput, 'focusout');

        // then
        assert.dom(screen.getByText(t('pages.join.fields.firstname.error'))).exists();
      });
    });

    ['Robert', 'Smith'].forEach(function (validString) {
      test(`should not display an error when firstName is "${validString}"`, async function (assert) {
        // given
        const screen = await render(<template><ScoForm /></template>);
        const firstNameInput = screen.getByRole('textbox', { name: FIRSTNAME_LABEL });

        // when
        await fillIn(firstNameInput, validString);
        await triggerEvent(firstNameInput, 'focusout');

        // then
        assert.dom(screen.queryByText(t('pages.join.fields.firstname.error'))).doesNotExist();
      });
    });
  });

  module('lastName validation', function () {
    ['', ' '].forEach(function (wrongString) {
      test(`should display an error when lastName is "${wrongString}"`, async function (assert) {
        // given
        const screen = await render(<template><ScoForm /></template>);
        const lastNameInput = screen.getByRole('textbox', { name: LASTNAME_LABEL });

        // when
        await fillIn(lastNameInput, wrongString);
        await triggerEvent(lastNameInput, 'focusout');

        // then
        assert.dom(screen.getByText(t('pages.join.fields.lastname.error'))).exists();
      });
    });

    ['Robert', 'Smith'].forEach(function (validString) {
      test(`should not display an error when lastName is "${validString}"`, async function (assert) {
        // given
        const screen = await render(<template><ScoForm /></template>);
        const lastNameInput = screen.getByRole('textbox', { name: LASTNAME_LABEL });

        // when
        await fillIn(lastNameInput, validString);
        await triggerEvent(lastNameInput, 'focusout');

        // then
        assert.dom(screen.queryByText(t('pages.join.fields.lastname.error'))).doesNotExist();
      });
    });
  });

  module('form submission', function () {
    test('should call onSubmit with the form values when the form is valid', async function (assert) {
      // given
      const onSubmit = sinon.stub().resolves();
      const screen = await render(<template><ScoForm @onSubmit={{onSubmit}} /></template>);

      await fillForm({ screen, firstName: 'Robert', lastName: 'Smith', day: '10', month: '10', year: '2000' });

      // when
      await click(screen.getByRole('button', { name: t('pages.join.button') }));

      // then
      sinon.assert.calledWith(onSubmit, { firstName: 'Robert', lastName: 'Smith', birthdate: '2000-10-10' });
      assert.ok(true);
    });

    [
      {
        field: 'firstName',
        firstName: ' ',
        lastName: 'Smith',
        day: '10',
        month: '10',
        year: '2000',
        errorKey: 'pages.join.fields.firstname.error',
      },
      {
        field: 'lastName',
        firstName: 'Robert',
        lastName: '',
        day: '10',
        month: '10',
        year: '2000',
        errorKey: 'pages.join.fields.lastname.error',
      },
      {
        field: 'dayOfBirth',
        firstName: 'Robert',
        lastName: 'Smith',
        day: '99',
        month: '10',
        year: '2000',
        errorKey: 'pages.join.fields.birthdate.day-error',
      },
      {
        field: 'monthOfBirth',
        firstName: 'Robert',
        lastName: 'Smith',
        day: '10',
        month: '99',
        year: '2000',
        errorKey: 'pages.join.fields.birthdate.month-error',
      },
      {
        field: 'yearOfBirth',
        firstName: 'Robert',
        lastName: 'Smith',
        day: '10',
        month: '10',
        year: '99',
        errorKey: 'pages.join.fields.birthdate.year-error',
      },
    ].forEach(function ({ field, firstName, lastName, day, month, year, errorKey }) {
      test(`should display an error and not call onSubmit when ${field} is invalid`, async function (assert) {
        // given
        const onSubmit = sinon.stub().resolves();
        const screen = await render(<template><ScoForm @onSubmit={{onSubmit}} /></template>);

        await fillForm({ screen, firstName, lastName, day, month, year });

        // when
        await click(screen.getByRole('button', { name: t('pages.join.button') }));

        // then
        assert.dom(screen.getByText(t(errorKey))).exists();
        sinon.assert.notCalled(onSubmit);
      });
    });
  });
});
