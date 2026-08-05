import { findByUserIdAndSessionId } from '../../../../../../src/certification/session-management/application/api/candidate-authorization-api.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session Management | Integration | Application | Api | Candidate Authorization', function () {
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

    it('returns the candidate authorization DTO when found for given sessionId and userId', async function () {
      // given
      const idForEduCPE = databaseBuilder.factory.buildComplementaryCertification({
        key: Frameworks.EDU_CPE,
      }).id;
      const idForClea = databaseBuilder.factory.buildComplementaryCertification({
        key: Frameworks.CLEA,
      }).id;
      const idForProsante = databaseBuilder.factory.buildComplementaryCertification({
        key: Frameworks.PRO_SANTE,
      }).id;
      domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withSession({ sessionId: 1, accessCode: 'CHACHACHA' })
        .reconciled({ userId: 2, at: new Date('2021-01-01') })
        .subscribedTo({ framework: Frameworks.PRO_SANTE })
        .withCenterHabilitation({ scope: Frameworks.EDU_CPE })
        .withCenterHabilitation({ scope: Frameworks.CLEA })
        .withCenterHabilitation({ scope: Frameworks.PRO_SANTE })
        .withCertificationStartedAt({ certificationId: 55, startedAt: new Date('2020-01-01') })
        .asAuthorizedToStart()
        .withParameters({ id: 3 })
        .insertToDB({
          databaseBuilder,
          complementaryCertificationIdsByFramework: {
            [Frameworks.EDU_CPE]: idForEduCPE,
            [Frameworks.CLEA]: idForClea,
            [Frameworks.PRO_SANTE]: idForProsante,
          },
        });

      await databaseBuilder.commit();

      // when
      const candidateAuthorizationDTO = await findByUserIdAndSessionId({ userId: 2, sessionId: 1 });

      // then
      expect(candidateAuthorizationDTO).to.deep.equal({
        id: 3,
        isSessionAccessible: false,
        accessCode: 'CHACHACHA',
        userId: 2,
        authorizedToStart: true,
        certificationId: 55,
        hasExceededCertificationDuration: true,
        reconciledAt: new Date('2021-01-01'),
        subscription: Frameworks.PRO_SANTE,
        isCenterHabilitatedForCandidateSubscription: true,
      });
    });
  });
});
