import { services } from '../../../../../../src/certification/enrolment/application/services/index.js';
import { normalize } from '../../../../../../src/shared/infrastructure/utils/string-utils.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Application | Service | register-candidate-participation', function () {
  context('when certificability checks fail for a certification', function () {
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
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: 1234,
      });

      await databaseBuilder.commit();

      // when
      await catchErr(services.registerCandidateParticipation)({
        userId,
        sessionId,
        firstName: certificationCandidate.firstName,
        lastName: certificationCandidate.lastName,
        birthdate: certificationCandidate.birthdate,
        isFrenchDomainExtension: true,
        normalizeStringFnc: normalize,
      });

      // then
      const [candidate] = await knex('certification-candidates')
        .select('userId', 'reconciledAt')
        .where({ id: certificationCandidate.id });
      expect(candidate.userId).to.be.null;
      expect(candidate.reconciledAt).to.be.null;
    });
  });
});
