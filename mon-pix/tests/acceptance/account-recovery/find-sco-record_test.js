import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { currentURL } from '@ember/test-helpers';
import setupIntl from '../../helpers/setup-intl';
import { fillInByLabel } from '../../helpers/fill-in-by-label';
import { clickByLabel } from '../../helpers/click-by-label';
import { Response } from 'miragejs';
import { visit } from '@1024pix/ember-testing-library';

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
    assert.strictEqual(currentURL(), '/recuperer-mon-compte');
    assert.ok(
      screen.getByRole('heading', {
        name: this.intl.t('pages.account-recovery.find-sco-record.student-information.title'),
      })
    );
  });

  module('when submitting information form with valid data', function () {
    test('should hide student information form and show recover account confirmation step', async function (assert) {
      // given
      server.create('user', { id: 1, firstName, lastName, username });
      server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

      // when
      const screen = await visit('/recuperer-mon-compte');
      await fillStudentInformationFormAndSubmit(this);

      // then
      assert.notOk(
        screen.queryByRole('heading', {
          name: this.intl.t('pages.account-recovery.find-sco-record.student-information.title'),
        })
      );
      assert.ok(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName }),
        })
      );
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
      server.post('/sco-organization-learners/account-recovery', () => errorsApi);

      // when
      const screen = await visit('/recuperer-mon-compte');
      await fillStudentInformationFormAndSubmit(this);

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.errors.title'),
        })
      );
      assert.ok(screen.getByText(this.intl.t('pages.account-recovery.errors.key-used')));
      assert.ok(
        screen.getByRole('link', {
          name: this.intl.t('navigation.back-to-homepage'),
        })
      );
    });

    module('click on "Cancel" button', function () {
      test('should return to student information form', async function (assert) {
        // given
        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        const screen = await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);

        // when
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.cancel'));

        // then
        assert.ok(
          screen.getByRole('heading', {
            name: this.intl.t('pages.account-recovery.find-sco-record.student-information.title'),
          })
        );
        assert.notOk(
          screen.queryByText(
            this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName })
          )
        );
      });
    });
  });

  module('when submitting information form with invalid data', function () {
    test('should show a not found error', async function (assert) {
      // given & when
      const screen = await visit('/recuperer-mon-compte');
      await fillStudentInformationFormAndSubmit(this);

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.find-sco-record.student-information.title'),
        })
      );
      assert.ok(
        screen.getByRole('link', {
          name: this.intl.t('pages.account-recovery.find-sco-record.contact-support.link-text'),
        })
      );
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
      const screen = await visit('/recuperer-mon-compte');
      await fillStudentInformationFormAndSubmit(this);

      // then
      assert.notOk(
        screen.queryByRole('heading', {
          name: this.intl.t('pages.account-recovery.find-sco-record.student-information.title'),
        })
      );
      assert.ok(
        screen.getByText(this.intl.t('pages.account-recovery.find-sco-record.conflict.found-you-but', { firstName }))
      );
    });
  });

  module('when confirming student information', function () {
    module('click on "Confirm" button', function () {
      test('should hide recover account confirmation step and show recover account backup email confirmation', async function (assert) {
        // given
        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        const screen = await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);

        // when
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account'));
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm'));

        // then
        assert.ok(
          screen.getByRole('heading', {
            name: this.intl.t(
              'pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message',
              {
                firstName,
              }
            ),
          })
        );
        assert.notOk(
          screen.queryByRole('heading', {
            name: this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName }),
          })
        );
      });

      test('should show an error when email already exists', async function (assert) {
        // given
        const email = 'john.doe@example.net';

        server.create('user', { id: 1, firstName, lastName, username, email });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        const screen = await visit('/recuperer-mon-compte');
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
        assert.ok(
          screen.getByText(
            this.intl.t(
              'pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.new-email-already-exist'
            )
          )
        );
      });

      test('should show email sent confirmation when user has supplied an email and submitted', async function (assert) {
        // given
        const newEmail = 'john.doe@example.net';

        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        const screen = await visit('/recuperer-mon-compte');
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
        assert.ok(
          screen.getByRole('heading', {
            name: this.intl.t('pages.account-recovery.find-sco-record.send-email-confirmation.title'),
          })
        );
        assert.notOk(
          screen.queryByRole('heading', {
            name: this.intl.t(
              'pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message',
              {
                firstName,
              }
            ),
          })
        );
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

        const screen = await visit('/recuperer-mon-compte');
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
        assert.ok(
          screen.getByRole('heading', {
            name: this.intl.t('pages.account-recovery.errors.title'),
          })
        );
        assert.ok(screen.getByText(this.intl.t('pages.account-recovery.errors.key-used')));
        assert.ok(
          screen.getByRole('link', {
            name: this.intl.t('navigation.back-to-homepage'),
          })
        );
      });

      test("should redirect to error page when there's an internal error", async function (assert) {
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

        const screen = await visit('/recuperer-mon-compte');
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
        assert.ok(
          screen.getByRole('heading', {
            name: this.intl.t('pages.account-recovery.errors.title'),
          })
        );
        assert.ok(screen.getByText(this.intl.t('common.api-error-messages.internal-server-error')));
        assert.ok(
          screen.getByRole('link', {
            name: this.intl.t('navigation.back-to-homepage'),
          })
        );
      });
    });

    module('click on "Cancel" button', function () {
      test('should return to student information form', async function (assert) {
        // given

        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        const screen = await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);

        // when
        await clickByLabel(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.cancel')
        );

        // then
        assert.ok(
          screen.getByRole('heading', {
            name: this.intl.t('pages.account-recovery.find-sco-record.student-information.title'),
          })
        );
        assert.notOk(
          screen.queryByRole('heading', {
            name: this.intl.t(
              'pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message',
              {
                firstName,
              }
            ),
          })
        );
      });
    });
  });
});
