import { findByUserIdAndSessionId } from '../../../../../../src/certification/session-management/infrastructure/repositories/candidate-authorization-info-repository.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session Management | Integration | Infrastructure | Repositories | Candidate Authorization Info', function () {
  describe('#findByUserIdAndSessionId', function () {
    it('returns null when no candidate found for given sessionId and userId', async function () {
      // given
      domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withSession({ sessionId: 1 })
        .reconciled({ userId: 2 })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withSession({ sessionId: 3 })
        .reconciled({ userId: 4 })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      // when
      const candidateAuthA = await findByUserIdAndSessionId({ userId: 2, sessionId: 3 });
      const candidateAuthB = await findByUserIdAndSessionId({ userId: 4, sessionId: 1 });

      // then
      expect(candidateAuthA).to.be.null;
      expect(candidateAuthB).to.be.null;
    });

    it('returns the candidate authorization info when found for given sessionId and userId', async function () {
      // given
      const idForEduCPE = databaseBuilder.factory.buildComplementaryCertification({
        key: Frameworks.EDU_CPE,
      }).id;
      const idForClea = databaseBuilder.factory.buildComplementaryCertification({
        key: Frameworks.CLEA,
      }).id;
      const expectedCandidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withSession({ sessionId: 1, accessCode: 'CHACHACHA' })
        .reconciled({ userId: 2, at: new Date() })
        .withCenterHabilitation({ scope: Frameworks.EDU_CPE })
        .withCenterHabilitation({ scope: Frameworks.CLEA })
        .subscribedTo({ framework: Frameworks.EDU_CPE })
        .asAuthorizedToStart()
        .insertToDB({
          databaseBuilder,
          complementaryCertificationIdsByFramework: {
            [Frameworks.EDU_CPE]: idForEduCPE,
            [Frameworks.CLEA]: idForClea,
          },
        });

      await databaseBuilder.commit();

      // when
      const candidateAuth = await findByUserIdAndSessionId({ userId: 2, sessionId: 1 });

      // then
      expect(candidateAuth).to.deepEqualInstance(expectedCandidateAuthorizationInfo);
    });

    it('returns expected data when candidate authorization found with started certification', async function () {
      // given
      const idForClea = databaseBuilder.factory.buildComplementaryCertification({
        key: Frameworks.CLEA,
      }).id;
      const expectedCandidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withSession({
          sessionId: 1,
          accessCode: 'CHACHACHA',
          startedAt: new Date('2023-02-02T10:43:00Z'),
        })
        .withCertificationStartedAt({ certificationId: 10, startedAt: new Date('2023-02-02T11:00:00Z') })
        .reconciled({ userId: 2 })
        .withCenterHabilitation({ scope: Frameworks.CLEA })
        .asAuthorizedToStart()
        .insertToDB({
          databaseBuilder,
          complementaryCertificationIdsByFramework: {
            [Frameworks.CLEA]: idForClea,
          },
        });

      await databaseBuilder.commit();

      // when
      const candidateAuth = await findByUserIdAndSessionId({ userId: 2, sessionId: 1 });

      // then
      expect(candidateAuth).to.deepEqualInstance(expectedCandidateAuthorizationInfo);
    });
  });
});
