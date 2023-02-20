import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Controller | session-controller-delete-certification-candidate', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('#deleteCertificationCandidate', function () {
    let sessionId;
    let userId;
    let certificationCandidateId;
    let options;

    beforeEach(function () {
      userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

      options = {
        method: 'DELETE',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };
      return databaseBuilder.commit();
    });

    context('when the candidate is linked', function () {
      beforeEach(function () {
        certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
        options.url = `/api/sessions/${sessionId}/certification-candidates/${certificationCandidateId}`;
        return databaseBuilder.commit();
      });

      it('should return a 403 forbidden error', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when the candidate is not linked', function () {
      beforeEach(function () {
        certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: null }).id;
        options.url = `/api/sessions/${sessionId}/certification-candidates/${certificationCandidateId}`;
        return databaseBuilder.commit();
      });

      it('should return 204 status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
