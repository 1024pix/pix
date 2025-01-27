import _ from 'lodash';

import {
  SendingEmailError,
  SendingEmailToInvalidDomainError,
  SendingEmailToInvalidEmailAddressError,
} from '../../../../../src/shared/domain/errors.js';
import { EmailingAttempt } from '../../../../../src/shared/domain/models/EmailingAttempt.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { mailService } from '../../../../../src/shared/domain/services/mail-service.js';
import * as organizationRepository from '../../../../../src/shared/infrastructure/repositories/organization-repository.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import { organizationInvitationService } from '../../../../../src/team/domain/services/organization-invitation.service.js';
import { organizationInvitationRepository } from '../../../../../src/team/infrastructure/repositories/organization-invitation.repository.js';
import { catchErr, databaseBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Integration | Team | Domain | Service | organization-invitation', function () {
  describe('#createOrUpdateOrganizationInvitation', function () {
    let clock;
    const now = new Date('2021-01-02');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('creates a new organization invitation with organizationId, email, role and status', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      const email = 'member@example.net';
      const role = Membership.roles.ADMIN;
      const locale = 'fr';
      const expectedOrganizationInvitation = {
        organizationId,
        email,
        status: OrganizationInvitation.StatusType.PENDING,
        role,
        locale,
      };

      // when
      const result = await organizationInvitationService.createOrUpdateOrganizationInvitation({
        organizationId,
        email,
        role,
        locale,
        organizationRepository,
        organizationInvitationRepository,
      });

      // then
      expect(result).to.be.instanceOf(OrganizationInvitation);
      expect(_.omit(result, ['id', 'code', 'organizationName', 'createdAt', 'updatedAt'])).to.deep.equal(
        expectedOrganizationInvitation,
      );
    });

    it('re-sends an email with same code when organization invitation already exists with status pending', async function () {
      // given
      const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationInvitationService.createOrUpdateOrganizationInvitation({
        organizationId: organizationInvitation.organizationId,
        email: organizationInvitation.email,
        organizationRepository,
        organizationInvitationRepository,
      });

      // then
      const expectedOrganizationInvitation = {
        ...organizationInvitation,
        updatedAt: now,
      };
      expect(_.omit(result, 'organizationName')).to.deep.equal(expectedOrganizationInvitation);
    });

    context('when recipient email has an invalid domain', function () {
      it('throws a SendingEmailToInvalidDomainError', async function () {
        // given
        const emailWithInvalidDomain = 'someone@consideredInvalidDomain.net';
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
          email: emailWithInvalidDomain,
          status: OrganizationInvitation.StatusType.PENDING,
        });
        await databaseBuilder.commit();

        const emailingAttempt = EmailingAttempt.failure(
          emailWithInvalidDomain,
          EmailingAttempt.errorCode.INVALID_DOMAIN,
        );
        sinon.stub(mailService, 'sendOrganizationInvitationEmail');
        mailService.sendOrganizationInvitationEmail.resolves(emailingAttempt);

        // when
        const error = await catchErr(organizationInvitationService.createOrUpdateOrganizationInvitation)({
          organizationId: organizationInvitation.organizationId,
          email: emailWithInvalidDomain,
          organizationRepository,
          organizationInvitationRepository,
          dependencies: {
            mailService,
          },
        });

        // then
        expect(error).to.be.an.instanceOf(SendingEmailToInvalidDomainError);
        expect(error.message).to.equal(
          'Failed to send email to "someone@consideredInvalidDomain.net" because domain seems to be invalid.',
        );
      });
    });

    context('when recipient email is invalid', function () {
      it('throws a SendingEmailToInvalidEmailAddressError', async function () {
        // given
        const invalidEmail = 'considered_invalid@example.net';
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
          email: invalidEmail,
          status: OrganizationInvitation.StatusType.PENDING,
        });
        await databaseBuilder.commit();

        const emailingAttempt = EmailingAttempt.failure(invalidEmail, EmailingAttempt.errorCode.INVALID_EMAIL);
        sinon.stub(mailService, 'sendOrganizationInvitationEmail');
        mailService.sendOrganizationInvitationEmail.resolves(emailingAttempt);

        // when
        const error = await catchErr(organizationInvitationService.createOrUpdateOrganizationInvitation)({
          organizationId: organizationInvitation.organizationId,
          email: invalidEmail,
          organizationRepository,
          organizationInvitationRepository,
          dependencies: {
            mailService,
          },
        });

        // then
        expect(error).to.be.an.instanceOf(SendingEmailToInvalidEmailAddressError);
        expect(error.message).to.equal(
          'Failed to send email to "considered_invalid@example.net" because email address seems to be invalid.',
        );
      });
    });

    context('when email sending fails for some unknown reason', function () {
      it('throws a generic SendingEmailError', async function () {
        // given
        const email = 'invitation@example.net';
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
          status: OrganizationInvitation.StatusType.PENDING,
          email,
        });
        await databaseBuilder.commit();

        const emailingAttempt = EmailingAttempt.failure(email);
        sinon.stub(mailService, 'sendOrganizationInvitationEmail');
        mailService.sendOrganizationInvitationEmail.resolves(emailingAttempt);

        // when
        const result = await catchErr(organizationInvitationService.createOrUpdateOrganizationInvitation)({
          organizationId: organizationInvitation.organizationId,
          email,
          organizationRepository,
          organizationInvitationRepository,
          dependencies: {
            mailService,
          },
        });

        // then
        expect(result).to.be.an.instanceOf(SendingEmailError);
        expect(result.message).to.equal('Failed to send email to "invitation@example.net" for some unknown reason.');
      });
    });
  });
});
