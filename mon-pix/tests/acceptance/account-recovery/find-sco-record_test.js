import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import setupIntl from '../../helpers/setup-intl';
import { fillInByLabel } from '../../helpers/fill-in-by-label';
import { clickByLabel } from '../../helpers/click-by-label';
import { contains } from '../../helpers/contains';
import { Response } from 'ember-cli-mirage';

module('Acceptance | account-recovery | FindScoRecordRoute', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  const ineIna = '0123456789A';
  const lastName = 'Lecol';
  const firstName = 'Manuela';
  const birthdate = '2000-05-20';
  const username = 'manuela.lecol2005';

  const fillStudentInformationFormAndSubmit = async (
    currentThis,
    {
      ineIna = '0123456789A',
      lastName = 'Lecol',
      firstName = 'Manuela',
      dayOfBirth = 20,
      monthOfBirth = 5,
      yearOfBirth = 2000,
    } = {}
  ) => {
    await fillInByLabel(
      currentThis.intl.t('pages.account-recovery.find-sco-record.student-information.form.ine-ina'),
      ineIna
    );
    await fillInByLabel(
      currentThis.intl.t('pages.account-recovery.find-sco-record.student-information.form.first-name'),
      firstName
    );
    await fillInByLabel(
      currentThis.intl.t('pages.account-recovery.find-sco-record.student-information.form.last-name'),
      lastName
    );
    await fillInByLabel(
      currentThis.intl.t('pages.account-recovery.find-sco-record.student-information.form.label.birth-day'),
      dayOfBirth
    );
    await fillInByLabel(
      currentThis.intl.t('pages.account-recovery.find-sco-record.student-information.form.label.birth-month'),
      monthOfBirth
    );
    await fillInByLabel(
      currentThis.intl.t('pages.account-recovery.find-sco-record.student-information.form.label.birth-year'),
      yearOfBirth
    );
    await clickByLabel(currentThis.intl.t('pages.account-recovery.find-sco-record.student-information.form.submit'));
  };

  test('should display student information form', async function (assert) {
    // given & when
    const screen = await visit('/recuperer-mon-compte');

    // then
    assert.equal(currentURL(), '/recuperer-mon-compte');
    assert
      .dom(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.find-sco-record.student-information.title'),
        })
      )
      .exists();
  });

  module('when submitting information form with valid data', function () {
    test('should hide student information form and show recover account confirmation step', async function (assert) {
      // given
      server.create('user', { id: 1, firstName, lastName, username });
      server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

      // when
      await visit('/recuperer-mon-compte');
      await fillStudentInformationFormAndSubmit(this);

      // then
      assert
        .dom(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title')))
        .doesNotExist();
      assert
        .dom(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName })))
        .exists();
    });

    test('should redirect to error page when user has already left SCO', async function (assert) {
      // given
      const errorsApi = new Response(
        403,
        {},
        {
          errors: [
            {
              status: '403',
            },
          ],
        }
      );
      server.post('/schooling-registration-dependent-users/recover-account', () => errorsApi);

      // when
      await visit('/recuperer-mon-compte');
      await fillStudentInformationFormAndSubmit(this);

      // then
      assert.dom(contains(this.intl.t('pages.account-recovery.errors.title'))).exists();
      assert.dom(contains(this.intl.t('pages.account-recovery.errors.key-used'))).exists();
      assert.dom(contains(this.intl.t('navigation.back-to-homepage'))).exists();
    });

    module('click on "Cancel" button', function () {
      test('should return to student information form', async function (assert) {
        // given
        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);

        // when
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.cancel'));

        // then
        assert.dom(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title'))).exists();
        assert
          .dom(
            contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName }))
          )
          .doesNotExist();
      });
    });
  });

  module('when submitting information form with invalid data', function () {
    test('should show a not found error', async function (assert) {
      // given & when
      await visit('/recuperer-mon-compte');
      await fillStudentInformationFormAndSubmit(this);

      // then
      assert.dom(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title'))).exists();
      assert
        .dom(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.not-found')))
        .exists();
    });
  });

  module('when two students used same account', function () {
    test('should redirect to account recovery conflict page', async function (assert) {
      // given
      server.create('user', {
        id: 1,
        firstName,
        lastName,
      });

      server.create('student-information', {
        id: 2,
        ineIna,
        firstName,
        lastName,
        birthdate: '2000-5-20',
      });

      //when
      await visit('/recuperer-mon-compte');
      await fillStudentInformationFormAndSubmit(this);

      // then
      assert
        .dom(contains(this.intl.t('pages.account-recovery.find-sco-record.conflict.found-you-but', { firstName })))
        .exists();
      assert
        .dom(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title')))
        .doesNotExist();
    });
  });

  module('when confirming student information', function () {
    module('click on "Confirm" button', function () {
      test('should hide recover account confirmation step and show recover account backup email confirmation', async function (assert) {
        // given
        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);

        // when
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account'));
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm'));

        // then
        assert
          .dom(
            contains(
              this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message', {
                firstName,
              })
            )
          )
          .exists();
        assert
          .dom(
            contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName }))
          )
          .doesNotExist();
      });

      test('should show an error when email already exists', async function (assert) {
        // given
        const email = 'john.doe@example.net';

        server.create('user', { id: 1, firstName, lastName, username, email });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account'));
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm'));

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email'),
          email
        );
        await clickByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit')
        );

        // then
        assert
          .dom(
            contains(
              this.intl.t(
                'pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.new-email-already-exist'
              )
            )
          )
          .exists();
      });

      test('should show email sent confirmation when user has supplied an email and submitted', async function (assert) {
        // given
        const newEmail = 'john.doe@example.net';

        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);

        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account'));
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm'));

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email'),
          newEmail
        );
        await clickByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit')
        );

        // then
        assert
          .dom(
            contains(
              this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message', {
                firstName,
              })
            )
          )
          .doesNotExist();
        assert
          .dom(contains(this.intl.t('pages.account-recovery.find-sco-record.send-email-confirmation.title')))
          .exists();
      });

      test('should redirect to error page when user has already left SCO', async function (assert) {
        // given
        const newEmail = 'john.doe@example.net';

        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        const errorsApi = new Response(
          403,
          {},
          {
            errors: [
              {
                status: '403',
              },
            ],
          }
        );
        server.post('/account-recovery', () => errorsApi);

        await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);

        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account'));
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm'));

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email'),
          newEmail
        );
        await clickByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit')
        );

        // then
        assert.dom(contains(this.intl.t('pages.account-recovery.errors.title'))).exists();
        assert.dom(contains(this.intl.t('pages.account-recovery.errors.key-used'))).exists();
        assert.dom(contains(this.intl.t('navigation.back-to-homepage'))).exists();
      });

      test("should redirect to error page when there's an internal error", async function () {
        // given
        const newEmail = 'john.doe@example.net';

        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        const errorsApi = new Response(
          500,
          {},
          {
            errors: [
              {
                status: '500',
              },
            ],
          }
        );
        server.post('/account-recovery', () => errorsApi);

        await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);

        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account'));
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm'));

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email'),
          newEmail
        );
        await clickByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit')
        );

        // then
        assert.dom(contains(this.intl.t('pages.account-recovery.errors.title'))).exists();
        assert.dom(contains(this.intl.t('api-error-messages.internal-server-error'))).exists();
        assert.dom(contains(this.intl.t('navigation.back-to-homepage'))).exists();
      });
    });

    module('click on "Cancel" button', function () {
      test('should return to student information form', async function (assert) {
        // given

        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);

        // when
        await clickByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.cancel')
        );

        // then
        assert
          .dom(
            contains(
              this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message', {
                firstName,
              })
            )
          )
          .doesNotExist();
        assert.dom(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title'))).exists();
      });
    });
  });
});
