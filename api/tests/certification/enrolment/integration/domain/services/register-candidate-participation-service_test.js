import { services } from '../../../../../../src/certification/enrolment/application/services/index.js';
import { normalize } from '../../../../../../src/shared/infrastructure/utils/string-utils.js';
import { databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Application | Service | register-candidate-participation', function () {
  context('when eligibility checks fail for a certification', function () {
    it('should rollback user reconciliation', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const userId = databaseBuilder.factory.buildUser({ id: 123 }).id;
      const sessionId = databaseBuilder.factory.buildSession({
        finalizedAt: null,
        certificationCenterId,
      }).id;
      const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'AA',
        lastName: 'BB',
        birthdate: '2004-12-25',
        sessionId,
        userId: null,
        reconciledAt: null,
      });
      databaseBuilder.factory.buildComplementaryCertification({ id: 1234 });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: certificationCandidate.id,
        complementaryCertificationId: 1234,
      });

      await databaseBuilder.commit();

      // when
      await services.registerCandidateParticipation({
        userId,
        sessionId,
        firstName: certificationCandidate.firstName,
        lastName: certificationCandidate.lastName,
        birthdate: certificationCandidate.birthdate,
        normalizeStringFnc: normalize,
      });

      // then
      const candidate = await knex('certification-candidates')
        .select('userId', 'reconciledAt')
        .where({ id: certificationCandidate.id });
      expect(candidate.userId).to.be.undefined;
      expect(candidate.reconciledAt).to.be.undefined;
    });
  });
});
