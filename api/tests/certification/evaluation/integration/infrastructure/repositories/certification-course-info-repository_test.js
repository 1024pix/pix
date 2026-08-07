import {
  find,
  findByUserIdAndSessionId,
} from '../../../../../../src/certification/evaluation/infrastructure/repositories/certification-course-info-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Integration | Infrastructure | Repository | CertificationCourseInfoRepository', function () {
  describe('#find', function () {
    context('when there is no certification for given id', function () {
      it('returns null', async function () {
        domainBuilder.certification.evaluation
          .certificationCourseInfoBuilder()
          .withParameters({ id: 123 })
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        const certificationCourseInfo = await find(111);

        expect(certificationCourseInfo).to.be.null;
      });
    });
    context('when there is a certification for id', function () {
      it('returns the CertificationCourseInfo', async function () {
        const expectedCertificationCourseInfo = domainBuilder.certification.evaluation
          .certificationCourseInfoBuilder()
          .withIdentity({ firstName: 'Anneso', lastName: 'Coucou' })
          .asAdjustedForAccessibility()
          .withNbChallenges(45)
          .withParameters({ id: 123, assessmentId: 456, candidateId: 789 })
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        const certificationCourseInfo = await find(123);

        expect(certificationCourseInfo).to.deepEqualInstance(expectedCertificationCourseInfo);
      });
    });
  });

  describe('#findByUserIdAndSessionId', function () {
    context('when there is no certification for given user id and session id', function () {
      it('returns null', async function () {
        const sessionId = databaseBuilder.factory.buildSession().id;
        const userId = databaseBuilder.factory.buildUser().id;
        domainBuilder.certification.evaluation
          .certificationCourseInfoBuilder()
          .insertToDB({ databaseBuilder, existingUserId: userId });
        domainBuilder.certification.evaluation
          .certificationCourseInfoBuilder()
          .insertToDB({ databaseBuilder, existingSessionId: sessionId });
        await databaseBuilder.commit();

        const certificationCourseInfo = await findByUserIdAndSessionId({ userId, sessionId });

        expect(certificationCourseInfo).to.be.null;
      });
    });

    context('when there is a certification for user and session', function () {
      it('returns the CertificationCourseInfo', async function () {
        const sessionId = databaseBuilder.factory.buildSession().id;
        const userId = databaseBuilder.factory.buildUser().id;
        const expectedCertificationCourseInfo = domainBuilder.certification.evaluation
          .certificationCourseInfoBuilder()
          .withIdentity({ firstName: 'Anneso', lastName: 'Coucou' })
          .asAdjustedForAccessibility()
          .withNbChallenges(45)
          .withParameters({ id: 123, assessmentId: 456, candidateId: 789 })
          .insertToDB({ databaseBuilder, existingUserId: userId, existingSessionId: sessionId });
        await databaseBuilder.commit();

        const certificationCourseInfo = await findByUserIdAndSessionId({ userId, sessionId });

        expect(certificationCourseInfo).to.deepEqualInstance(expectedCertificationCourseInfo);
      });
    });
  });
});
