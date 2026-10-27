import { expect } from 'chai';

import { findBySessionId } from '../../../../../../src/certification/session-management/infrastructure/repositories/session-authorization-info-repository.js';
import { SESSION_STATUSES } from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session Management | Integration | Infrastructure | Repositories | Session Authorization Info', function () {
  describe('#findBySessionId', function () {
    it('returns null when no session found for given sessionId', async function () {
      // given
      databaseBuilder.factory.buildSession({ id: 111 });
      await databaseBuilder.commit();

      // when
      const sessionAuth = await findBySessionId({ sessionId: 2 });

      // then
      expect(sessionAuth).to.be.null;
    });

    context('when session exists', function () {
      let sessionId, certificationCenterId;
      beforeEach(function () {
        certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId: 'foo', type: 'SCO' }).id;
      });

      it('returns SessionAuthorizationInfo model with expected data when it has a first certification started', async function () {
        // given
        sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId,
          finalizedAt: null,
          publishedAt: null,
          invigilatorPassword: '123456',
        }).id;
        const candidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
        databaseBuilder.factory.buildCertificationCourse({ candidateId, sessionId, createdAt: new Date() });

        await databaseBuilder.commit();

        // when
        const sessionAuth = await findBySessionId({ sessionId });

        // then
        const sessionStatus = domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status: SESSION_STATUSES.STARTED })
          .build();
        const expectedSessionAuthorizationInfo = domainBuilder.certification.sessionManagement
          .sessionAuthorizationInfoBuilder()
          .withParameters({
            id: sessionId,
            certificationCenterId,
            sessionStatus,
            invigilatorPassword: '123456',
          })
          .build();
        expect(sessionAuth).to.deepEqualInstance(expectedSessionAuthorizationInfo);
      });

      it('returns SessionAuthorizationInfo model with expected data when certification center has a matching SCO ismanaging students orga', async function () {
        // given
        sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId,
          finalizedAt: null,
          publishedAt: null,
          invigilatorPassword: '123456',
        }).id;
        const organizationId = databaseBuilder.factory.buildOrganization({
          externalId: 'foo',
          type: 'SCO',
          isManagingStudents: true,
        }).id;

        await databaseBuilder.commit();

        // when
        const sessionAuth = await findBySessionId({ sessionId });

        // then
        const sessionStatus = domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status: SESSION_STATUSES.CREATED })
          .build();
        const expectedSessionAuthorizationInfo = domainBuilder.certification.sessionManagement
          .sessionAuthorizationInfoBuilder()
          .hasMatchingScoIsManagingStudentsOrganization({ organizationId })
          .withParameters({
            id: sessionId,
            certificationCenterId,
            sessionStatus,
            invigilatorPassword: '123456',
          })
          .build();
        expect(sessionAuth).to.deepEqualInstance(expectedSessionAuthorizationInfo);
      });

      it('returns SessionAuthorizationInfo model with expected data when certification center has an archive date', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ id: 1, archivedAt: new Date() });
        sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId: 1,
          finalizedAt: null,
          publishedAt: null,
          invigilatorPassword: '123456',
        }).id;
        await databaseBuilder.commit();

        // when
        const sessionAuth = await findBySessionId({ sessionId });

        // then
        const sessionStatus = domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status: SESSION_STATUSES.CREATED })
          .build();
        const expectedSessionAuthorizationInfo = domainBuilder.certification.sessionManagement
          .sessionAuthorizationInfoBuilder()
          .certificationCenterIsArchived()
          .withParameters({
            id: sessionId,
            certificationCenterId: 1,
            sessionStatus,
            invigilatorPassword: '123456',
          })
          .build();
        expect(sessionAuth).to.deepEqualInstance(expectedSessionAuthorizationInfo);
      });

      it('returns SessionAuthorizationInfo model with expected data when certification center has been archived by someone', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenter({ id: 1, archivedBy: userId });
        sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId: 1,
          finalizedAt: null,
          publishedAt: null,
          invigilatorPassword: '123456',
        }).id;
        await databaseBuilder.commit();

        // when
        const sessionAuth = await findBySessionId({ sessionId });

        // then
        const sessionStatus = domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status: SESSION_STATUSES.CREATED })
          .build();
        const expectedSessionAuthorizationInfo = domainBuilder.certification.sessionManagement
          .sessionAuthorizationInfoBuilder()
          .certificationCenterIsArchived()
          .withParameters({
            id: sessionId,
            certificationCenterId: 1,
            sessionStatus,
            invigilatorPassword: '123456',
          })
          .build();
        expect(sessionAuth).to.deepEqualInstance(expectedSessionAuthorizationInfo);
      });
    });
  });
});
