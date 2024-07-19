import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Certification | Enrolment | Acceptance | Application | Routes | subscription', function () {
  describe('GET /api/certification-candidates/:id/subscriptions', function () {
    it('should return the certification candidate subscriptions', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.CLEA,
        label: 'CléA Numérique',
      });
      const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
        label: 'Pix+ Droit',
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: certificationCenter.id,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: certificationCenter.id,
        complementaryCertificationId: pixPlusDroitComplementaryCertification.id,
      });
      const session = databaseBuilder.factory.buildSession({
        certificationCenterId: certificationCenter.id,
      });
      const candidate = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
      });

      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: candidate.id,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/certification-candidates/${candidate.id}/subscriptions`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId, 'pix-certif') },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        id: `${candidate.id}`,
        type: 'certification-candidate-subscriptions',
        attributes: {
          'session-id': session.id,
          'session-version': session.version,
          'eligible-subscription': null,
          'non-eligible-subscription': {
            id: cleaComplementaryCertification.id,
            label: 'CléA Numérique',
            key: ComplementaryCertificationKeys.CLEA,
          },
        },
      });
    });
  });
});
