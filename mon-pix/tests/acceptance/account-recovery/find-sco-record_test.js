import { describe } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { currentURL, visit } from '@ember/test-helpers';
import setupIntl from '../../helpers/setup-intl';
import { fillInByLabel } from '../../helpers/fill-in-by-label';
import { clickByLabel } from '../../helpers/click-by-label';
import { contains } from '../../helpers/contains';
import { Response } from 'ember-cli-mirage';

describe('Acceptance | account-recovery | FindScoRecordRoute', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

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

  it('should display student information form', async function () {
    // given & when
    await visit('/recuperer-mon-compte');

    // then
    expect(currentURL()).to.equal('/recuperer-mon-compte');
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title'))).to.exist;
  });

  context('when submitting information form with valid data', () => {
    it('should hide student information form and show recover account confirmation step', async function () {
      // given
      server.create('user', { id: 1, firstName, lastName, username });
      server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

      // when
      await visit('/recuperer-mon-compte');
      await fillStudentInformationFormAndSubmit(this);

      // then
      expect(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title'))).to.not.exist;
      expect(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName })))
        .to.exist;
    });

    it('should redirect to error page when user has already left SCO', async function () {
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
      expect(contains(this.intl.t('pages.account-recovery.errors.title'))).to.exist;
      expect(contains(this.intl.t('pages.account-recovery.errors.key-used'))).to.exist;
      expect(contains(this.intl.t('navigation.back-to-homepage'))).to.exist;
    });

    context('click on "Cancel" button', () => {
      it('should return to student information form', async function () {
        // given
        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);

        // when
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.cancel'));

        // then
        expect(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title'))).to.exist;
        expect(
          contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName }))
        ).to.not.exist;
      });
    });
  });

  context('when submitting information form with invalid data', () => {
    it('should show a not found error', async function () {
      // given & when
      await visit('/recuperer-mon-compte');
      await fillStudentInformationFormAndSubmit(this);

      // then
      expect(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title'))).to.exist;
      expect(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.errors.not-found'))).to
        .exist;
    });
  });

  context('when two students used same account', function () {
    it('should redirect to account recovery conflict page', async function () {
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
      expect(
        contains(this.intl.t('pages.account-recovery.find-sco-record.conflict.found-you-but', { firstName }))
      ).to.exist;
      expect(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title'))).to.not.exist;
    });
  });

  context('when confirming student information', () => {
    context('click on "Confirm" button', () => {
      it('should hide recover account confirmation step and show recover account backup email confirmation', async function () {
        // given
        server.create('user', { id: 1, firstName, lastName, username });
        server.create('student-information', { id: 2, ineIna, firstName, lastName, birthdate });

        await visit('/recuperer-mon-compte');
        await fillStudentInformationFormAndSubmit(this);

        // when
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account'));
        await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm'));

        // then
        expect(
          contains(
            this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message', {
              firstName,
            })
          )
        ).to.exist;
        expect(
          contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName }))
        ).to.not.exist;
      });

      it('should show an error when email already exists', async function () {
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
        expect(
          contains(
            this.intl.t(
              'pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.new-email-already-exist'
            )
          )
        ).to.exist;
      });

      it('should show email sent confirmation when user has supplied an email and submitted', async function () {
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
        expect(
          contains(
            this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message', {
              firstName,
            })
          )
        ).to.not.exist;
        expect(contains(this.intl.t('pages.account-recovery.find-sco-record.send-email-confirmation.title'))).to.exist;
      });

      it('should redirect to error page when user has already left SCO', async function () {
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
        expect(contains(this.intl.t('pages.account-recovery.errors.title'))).to.exist;
        expect(contains(this.intl.t('pages.account-recovery.errors.key-used'))).to.exist;
        expect(contains(this.intl.t('navigation.back-to-homepage'))).to.exist;
      });

      it("should redirect to error page when there's an internal error", async function () {
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
        expect(contains(this.intl.t('pages.account-recovery.errors.title'))).to.exist;
        expect(contains(this.intl.t('api-error-messages.internal-server-error'))).to.exist;
        expect(contains(this.intl.t('navigation.back-to-homepage'))).to.exist;
      });
    });

    context('click on "Cancel" button', () => {
      it('should return to student information form', async function () {
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
        expect(
          contains(
            this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message', {
              firstName,
            })
          )
        ).to.not.exist;
        expect(contains(this.intl.t('pages.account-recovery.find-sco-record.student-information.title'))).to.exist;
      });
    });
  });
});
