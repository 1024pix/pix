import { expect } from 'chai';
import sinon from 'sinon';

import { AnonymizeUserEventHandler } from '../../../../src/identity-access-management/application/jobs/anonymize-user.event-handler.js';
import { RemoveLegalDocumentByUserEventHandler } from '../../../../src/legal-documents/application/remove-legal-document-by-user.event-handler.js';
import { AnonymizeLearnersAndCampaignParticipationsEventHandler } from '../../../../src/prescription/learner-management/application/jobs/anonymize-learners-and-campaign-participations-event-handler.js';
import { PIX_ADMIN } from '../../../../src/shared/constants.js';
import { AuditLoggingJob } from '../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { featureToggles } from '../../../../src/shared/infrastructure/feature-toggles/index.js';
import { SendEmailJobController } from '../../../../src/shared/mail/application/jobs/send-email.job-controller.js';
import { AnonymizeCertificationCenterMembershipEventHandler } from '../../../../src/team/application/certification-center-membership/anonymize-certification-center-membership.event-handler.js';
import { AnonymizeMembershipEventHandler } from '../../../../src/team/application/membership/anonymize-membership.event-handler.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { getServer } from '../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

const anonymizeUserEventHandlerSubscribers = [
  AnonymizeUserEventHandler,
  RemoveLegalDocumentByUserEventHandler,
  AnonymizeLearnersAndCampaignParticipationsEventHandler,
  AnonymizeCertificationCenterMembershipEventHandler,
  AnonymizeMembershipEventHandler,
];

describe('Acceptance | Privacy | Application | Route | anonymize-user', function () {
  let server;

  const now = new Date('2024-04-05T03:04:05Z');

  beforeEach(async function () {
    server = await getServer();
    sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  describe('POST /api/admin/users/{id}/anonymize', function () {
    it('anomymizes user', async function () {
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: userId,
      });
      databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId });
      await databaseBuilder.commit();

      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/users/${userId}/anonymize`,
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      expect(response.statusCode).to.equal(204);

      anonymizeUserEventHandlerSubscribers.forEach((eventHandler) => {
        _expectHandlerReceivePayload(eventHandler, {
          userId,
          updatedByUserId: superAdmin.id,
        });
      });

      await expect(AuditLoggingJob.name).to.have.been.performed.withJobPayload({
        client: 'PIX_ADMIN',
        action: 'ANONYMIZATION',
        role: PIX_ADMIN.ROLES.SUPER_ADMIN,
        occurredAt: now.toISOString(),
        userId: superAdmin.id,
        targetUserIds: [userId],
      });
    });
  });

  describe('DELETE /api/users/me', function () {
    it('anonymizes the user and returns a 204 HTTP status code', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/users/me',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      // then
      expect(response.statusCode).to.equal(204);

      anonymizeUserEventHandlerSubscribers.forEach((eventHandler) => {
        _expectHandlerReceivePayload(eventHandler, {
          userId,
          updatedByUserId: userId,
        });
      });

      await expect(new SendEmailJobController().jobName).to.have.performed.withJobsCount(1);

      await expect(AuditLoggingJob.name).to.have.been.performed.withJobPayload({
        client: 'PIX_APP',
        action: 'ANONYMIZATION',
        role: 'USER',
        occurredAt: now.toISOString(),
        userId,
        targetUserIds: [userId],
      });
    });

    context('when user is not authenticated', function () {
      it('returns a 401 HTTP status code', async function () {
        // when
        const response = await server.inject({
          method: 'DELETE',
          url: '/api/users/me',
          headers: generateAuthenticatedUserRequestHeaders({ userId: null }),
        });

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when isSelfAccountDeletionEnabled feature toggle is set to false', function () {
      it('returns a 403 HTTP status code', async function () {
        // given
        await featureToggles.set('isSelfAccountDeletionEnabled', false);
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'DELETE',
          url: '/api/users/me',
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});

async function _expectHandlerReceivePayload(handlerClass, payload) {
  const handler = new handlerClass();
  await expect(handler.jobName).to.have.performed.withEventPayload(payload);
}
