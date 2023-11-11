import _ from 'lodash';
import { expect, databaseBuilder, sinon, catchErr } from '../../../test-helper.js';

import * as organizationInvitationRepository from '../../../../lib/infrastructure/repositories/organization-invitation-repository.js';
import * as organizationRepository from '../../../../lib/infrastructure/repositories/organization-repository.js';
import { mailService } from '../../../../lib/domain/services/mail-service.js';

import { OrganizationInvitation } from '../../../../lib/domain/models/OrganizationInvitation.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import { createOrUpdateOrganizationInvitation } from '../../../../lib/domain/services/organization-invitation-service.js';
import { EmailingAttempt } from '../../../../lib/domain/models/EmailingAttempt.js';
import { SendingEmailError } from '../../../../lib/domain/errors.js';

describe('Integration | Service | Organization-Invitation Service', function () {
  describe('#createOrUpdateOrganizationInvitation', function () {
    let clock;
    const now = new Date('2021-01-02');

    beforeEach(async function () {
      clock = sinon.useFakeTimers(now);
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
      const result = await createOrUpdateOrganizationInvitation({
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
      const result = await createOrUpdateOrganizationInvitation({
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
      const result = await catchErr(createOrUpdateOrganizationInvitation)({
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
