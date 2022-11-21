import { describe } from 'mocha';
import { expect } from 'chai';

import { setupApplicationTest } from 'ember-mocha';
import { currentURL, click } from '@ember/test-helpers';
import { Response } from 'miragejs';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, fillByLabel } from '@1024pix/ember-testing-library';
import setupIntl from '../../helpers/setup-intl';
import { clickByLabel } from '../../helpers/click-by-label';

describe('Acceptance | account-recovery | UpdateScoRecordRoute', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  context('and user clicks on email link', function () {
    it('should show reset password form', async function () {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      //when
      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);

      // then
      expect(currentURL()).to.equal(`/recuperer-mon-compte/${temporaryKey}`);

      expect(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.update-sco-record.welcome-message', { firstName: 'George' }),
        })
      ).to.exist;
    });

    it('should display an error message when account with email already exists', async function () {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        400,
        {},
        {
          errors: [
            {
              status: '400',
              code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS',
            },
          ],
        }
      );
      server.get(`/account-recovery/${temporaryKey}`, () => errorsApi);

      //when
      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);

      // then
      expect(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.errors.title'),
        })
      ).to.exist;
      expect(screen.getByText(this.intl.t('pages.account-recovery.errors.account-exists'))).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('navigation.back-to-homepage') })).to.exist;
    });

    it('should display an error message when user has already left SCO', async function () {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

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
      server.get(`/account-recovery/${temporaryKey}`, () => errorsApi);

      //when
      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);

      // then
      expect(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.errors.title'),
        })
      ).to.exist;
      expect(screen.getByText(this.intl.t('pages.account-recovery.errors.title'))).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('navigation.back-to-homepage') })).to.exist;
    });

    it('should display an error message when temporary key not found', async function () {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        404,
        {},
        {
          errors: [
            {
              status: '404',
            },
          ],
        }
      );
      server.get(`/account-recovery/${temporaryKey}`, () => errorsApi);

      //when
      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);

      // then
      expect(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.errors.title'),
        })
      ).to.exist;
      expect(screen.getByText(this.intl.t('pages.account-recovery.errors.key-invalid'))).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('navigation.back-to-homepage') })).to.exist;
    });

    it('should display an error message when temporary key has expired', async function () {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        401,
        {},
        {
          errors: [
            {
              status: '401',
            },
          ],
        }
      );
      server.get(`/account-recovery/${temporaryKey}`, () => errorsApi);

      //when
      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);

      // then
      expect(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.errors.title'),
        })
      ).to.exist;
      expect(
        screen.getByRole('link', { name: this.intl.t('pages.account-recovery.errors.key-expired-renew-demand-link') })
      ).to.exist;
    });
  });

  context('and user chooses a new password and accepts cgu and data protection policy', function () {
    it('should redirect to homepage after successful password change', async function () {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const email = 'George@example.net';
      const password = 'Password123';
      server.create('user', { id: 2, email, password });

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);

      await fillByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), password);
      await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

      // when
      await clickByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));

      // then
      expect(currentURL()).to.equal('/accueil');
    });

    it('should display an error message when account with email already exists', async function () {
      // given
      const newPassword = 'Pix1234*';
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        400,
        {},
        {
          errors: [
            {
              status: '400',
              code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS',
            },
          ],
        }
      );
      server.patch('/account-recovery', () => errorsApi);

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      await fillByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), newPassword);
      await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

      // when
      await clickByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));

      // then
      expect(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.errors.title'),
        })
      ).to.exist;
      expect(screen.getByText(this.intl.t('pages.account-recovery.errors.account-exists'))).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('navigation.back-to-homepage') })).to.exist;
    });

    it('should display an error message when user has already left SCO', async function () {
      // given
      const newPassword = 'Pix1234*';
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

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
      server.patch('/account-recovery', () => errorsApi);

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      await fillByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), newPassword);
      await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

      // when
      await clickByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));

      // then
      expect(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.errors.title'),
        })
      ).to.exist;
      expect(screen.getByText(this.intl.t('pages.account-recovery.errors.key-used'))).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('navigation.back-to-homepage') })).to.exist;
    });

    it('should display an error message when temporary key not found', async function () {
      // given
      const newPassword = 'Pix1234*';
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        404,
        {},
        {
          errors: [
            {
              status: '404',
            },
          ],
        }
      );
      server.patch('/account-recovery', () => errorsApi);

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      await fillByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), newPassword);
      await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

      // when
      await clickByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));

      // then
      expect(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.errors.title'),
        })
      ).to.exist;
      expect(screen.getByText(this.intl.t('pages.account-recovery.errors.key-invalid'))).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('navigation.back-to-homepage') })).to.exist;
    });

    it('should display an error message when temporary key has expired', async function () {
      // given
      const newPassword = 'Pix1234*';
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        401,
        {},
        {
          errors: [
            {
              status: '401',
            },
          ],
        }
      );
      server.patch('/account-recovery', () => errorsApi);

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      await fillByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), newPassword);
      await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

      // when
      await clickByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));

      // then
      expect(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.errors.title'),
        })
      ).to.exist;
      expect(
        screen.getByRole('link', { name: this.intl.t('pages.account-recovery.errors.key-expired-renew-demand-link') })
      ).to.exist;
    });

    it('should display an error message when internal server error returned', async function () {
      // given
      const newPassword = 'Pix1234*';
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

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
      server.patch('/account-recovery', () => errorsApi);

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      await fillByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), newPassword);
      await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

      // when
      await clickByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));

      // then
      expect(
        screen.getByRole('heading', {
          name: this.intl.t('pages.account-recovery.errors.title'),
        })
      ).to.exist;
      expect(screen.getByText(this.intl.t('api-error-messages.internal-server-error'))).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('navigation.back-to-homepage') })).to.exist;
    });
  });
});
