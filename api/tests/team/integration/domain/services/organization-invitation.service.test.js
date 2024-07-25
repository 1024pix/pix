import _ from 'lodash';

import { mailService } from '../../../../../lib/domain/services/mail-service.js';
import { SendingEmailError } from '../../../../../src/shared/domain/errors.js';
import { EmailingAttempt } from '../../../../../src/shared/domain/models/EmailingAttempt.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
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

    it('should create a new organization-invitation with organizationId, email, role and status', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      const email = 'member@organization.org';
      const role = Membership.roles.ADMIN;
      const expectedOrganizationInvitation = {
        organizationId,
        email,
        status: OrganizationInvitation.StatusType.PENDING,
        role,
      };

      // when
      const result = await organizationInvitationService.createOrUpdateOrganizationInvitation({
        organizationId,
        email,
        role,
        organizationRepository,
        organizationInvitationRepository,
      });

      // then
      expect(result).to.be.instanceOf(OrganizationInvitation);
      expect(_.omit(result, ['id', 'code', 'organizationName', 'createdAt', 'updatedAt'])).to.deep.equal(
        expectedOrganizationInvitation,
      );
    });

    it('should re-send an email with same code when organization-invitation already exist with status pending', async function () {
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

    it('should throw an error if email was not send', async function () {
      // given
      const email = 'invitation@example.net';
      const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
        email,
      });
      await databaseBuilder.commit();

      const mailerResponse = EmailingAttempt.failure(email);
      sinon.stub(mailService, 'sendOrganizationInvitationEmail');
      mailService.sendOrganizationInvitationEmail.resolves(mailerResponse);

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
    });
  });
});
