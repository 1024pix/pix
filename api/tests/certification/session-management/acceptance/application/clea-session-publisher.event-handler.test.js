import { expect } from 'chai';
import sinon from 'sinon';

import { CleaSessionPublishedEventHandler } from '../../../../../src/certification/session-management/application/clea-session-published.event-handler.js';
import { mailService } from '../../../../../src/certification/session-management/domain/services/mail-service.js';
import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Acceptance | Application | Clea Session Published Event Handler ', function () {
  describe('#handle', function () {
    it('should send email', async function () {
      // given
      const publishedAt = new Date('2024-11-22');

      const referer = await databaseBuilder.factory.buildUser();
      const certificationCenter = await databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.factory.buildCertificationCenterMembership({
        userId: referer.id,
        certificationCenterId: certificationCenter.id,
        isReferer: true,
      });

      const session = await databaseBuilder.factory.buildSession({
        certificationCenterId: certificationCenter.id,
        publishedAt,
      });
      await databaseBuilder.factory.buildFinalizedSession({ sessionId: session.id, publishedAt });

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId: session.id });
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.CLEA,
      });
      const complementaryCertificationCourse = databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId: certificationCourse.id,
        complementaryCertificationId: complementaryCertification.id,
        sessionId: session.id,
      });
      const complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
        complementaryCertificationId: complementaryCertification.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationBadgeId: complementaryCertificationBadge.id,
        complementaryCertificationCourseId: complementaryCertificationCourse.id,
        acquired: true,
      });

      await databaseBuilder.commit();

      const sendNotificationToCertificationCenterRefererForCleaResultsEmailSpy = sinon.spy(
        mailService,
        'sendNotificationToCertificationCenterRefererForCleaResults',
      );

      // when
      const handler = new CleaSessionPublishedEventHandler();
      const data = {
        sessionId: session.id,
        publishedAt,
      };
      await handler.handle({ data });

      // then
      expect(sendNotificationToCertificationCenterRefererForCleaResultsEmailSpy).to.have.been.calledWithExactly({
        sessionId: session.id,
        email: referer.email,
        sessionDate: session.date,
      });
    });

    it('should not send email when there is no Clea certification', async function () {
      // given
      const publishedAt = new Date('2024-11-22');

      const referer = databaseBuilder.factory.buildUser();
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: referer.id,
        certificationCenterId: certificationCenter.id,
        isReferer: true,
      });

      const session = await databaseBuilder.factory.buildSession({
        certificationCenterId: certificationCenter.id,
        publishedAt,
      });
      await databaseBuilder.factory.buildFinalizedSession({ sessionId: session.id, publishedAt });

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId: session.id });
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.DROIT,
      });
      const complementaryCertificationCourse = databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId: certificationCourse.id,
        complementaryCertificationId: complementaryCertification.id,
        sessionId: session.id,
      });
      const complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
        complementaryCertificationId: complementaryCertification.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationBadgeId: complementaryCertificationBadge.id,
        complementaryCertificationCourseId: complementaryCertificationCourse.id,
        acquired: true,
      });

      await databaseBuilder.commit();

      const sendNotificationToCertificationCenterRefererForCleaResultsEmailSpy = sinon.spy(
        mailService,
        'sendNotificationToCertificationCenterRefererForCleaResults',
      );

      // when
      const handler = new CleaSessionPublishedEventHandler();
      const data = {
        sessionId: session.id,
        publishedAt,
      };
      await handler.handle({
        data,
      });

      // then
      expect(sendNotificationToCertificationCenterRefererForCleaResultsEmailSpy).to.have.not.been.called;
    });
  });
});
