import { expect } from 'chai';
import sinon from 'sinon';

import {mailService} from '../../../../../src/certification/session-management/domain/services/mail-service.js';
import { ComplementaryCertification } from '../../../../../src/certification/shared/domain/models/ComplementaryCertification.js';
import { CleaSessionPublishedEventHandler } from '../../../../../src/certification/session-management/application/clea-session-published.event-handler.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Acceptance | Application | Clea Session Published Event Handler ', function () {
  describe('#handle', function () {
    it.only('should send email', async function () {
      // given
      const publishedAt = new Date('2024-11-22')

      const referer = await databaseBuilder.factory.buildUser()
      const certificationCenter = await databaseBuilder.factory.buildCertificationCenter();
      const certifCenterMemberShip = await databaseBuilder.factory.buildCertificationCenterMembership({userId: referer.id, certificationCenterId: certificationCenter.id, isReferer: true})

      const session = await databaseBuilder.factory.buildSession({certificationCenterId: certificationCenter.id, publishedAt });
      await databaseBuilder.factory.buildFinalizedSession({sessionId: session.id, publishedAt});

      const certificationCourse =  databaseBuilder.factory.buildCertificationCourse({sessionId: session.id});
      const complementaryCertification =  databaseBuilder.factory.buildComplementaryCertification({key: ComplementaryCertification.CLEA});
      const complementaryCertificationCourse = databaseBuilder.factory.buildComplementaryCertificationCourse({certificationCourseId: certificationCourse.id, complementaryCertificationId: complementaryCertification.id, sessionId: session.id});
      const complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({ complementaryCertificationId: complementaryCertification.id });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({complementaryCertificationBadgeId: complementaryCertificationBadge.id, complementaryCertificationCourseId: complementaryCertificationCourse.id, acquired: true});

      await databaseBuilder.commit();
      
      const sendNotificationResultForCleaMailServiceSpy = sinon.spy(
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
      expect(sendNotificationResultForCleaMailServiceSpy).to.have.been.calledWithExactly({
        sessionId: session.id,
        email: referer.email,
        sessionDate: session.date,
      });
    });

    it('should not send email when there is no Clea certification', async function () {
      // given
      const publishedAt = new Date('2024-11-22')

      const referer = databaseBuilder.factory.buildUser()
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const certifCenterMemberShip = databaseBuilder.factory.buildCertificationCenterMembership({userId: referer.id, certificationCenterId: certificationCenter.id, isReferer: true})

      const session = await databaseBuilder.factory.buildSession({certificationCenterId: certificationCenter.id, publishedAt });
      await databaseBuilder.factory.buildFinalizedSession({sessionId: session.id, publishedAt });

      const certificationCourse =  databaseBuilder.factory.buildCertificationCourse({sessionId: session.id});
      const complementaryCertification =  databaseBuilder.factory.buildComplementaryCertification({key: ComplementaryCertification.DROIT});
      const complementaryCertificationCourse = databaseBuilder.factory.buildComplementaryCertificationCourse({certificationCourseId: certificationCourse.id, complementaryCertificationId: complementaryCertification.id, sessionId: session.id});
      const complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({ complementaryCertificationId: complementaryCertification.id });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({complementaryCertificationBadgeId: complementaryCertificationBadge.id, complementaryCertificationCourseId: complementaryCertificationCourse.id, acquired: true});

      await databaseBuilder.commit();

      const sendNotificationResultForCleaMailServiceSpy = sinon.spy(
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
      expect(sendNotificationResultForCleaMailServiceSpy).to.have.not.been.called;
    })

/*

  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn
    .select(1)
    .from('sessions')
    .innerJoin('certification-courses', 'certification-courses.sessionId', 'sessions.id')
    .innerJoin(
      'complementary-certification-courses',
      'complementary-certification-courses.certificationCourseId',
      'certification-courses.id',
    )
    .innerJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-courses.complementaryCertificationId',
    )
    .innerJoin(
      'complementary-certification-course-results',
      'complementary-certification-course-results.complementaryCertificationCourseId',
      'complementary-certification-courses.id',
    )
    .where('sessions.id', id)
    .whereNotNull('sessions.publishedAt')
    .where('complementary-certification-course-results.acquired', true)
    .where('complementary-certifications.key', ComplementaryCertificationKeys.CLEA)
    .first();
  return Boolean(result);



  const hasSomeCleaAcquired = await sessionManagementRepository.hasSomeCleaAcquired({ id: session.id });
  if (!hasSomeCleaAcquired) {
    logger.debug(`No CLEA certifications in session ${session.id}`);
    return;
  }




  

  const refererEmails = await certificationCenterRepository.getRefererEmails({ id: session.certificationCenterId });
  if (refererEmails.length <= 0) {
    logger.warn(`Publishing session ${session.id} with Clea certifications but no referer. No email will be sent`);
    return;
  }

  */
    
  });
});
