const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-delete-certification-candidate', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('#deleteCertificationCandidate', () => {
    let sessionId;
    let userId;
    let certificationCandidateId;
    let options;

    beforeEach(() => {
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

    context('when the candidate is linked', () => {

      beforeEach(() => {
        certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
        options.url = `/api/sessions/${sessionId}/certification-candidates/${certificationCandidateId}`;
        return databaseBuilder.commit();
      });

      it('should return a 403 forbidden error', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

    });

    context('when the candidate is not linked', () => {

      beforeEach(() => {
        certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: null }).id;
        options.url = `/api/sessions/${sessionId}/certification-candidates/${certificationCandidateId}`;
        return databaseBuilder.commit();
      });

      it('should return 204 status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });

    });
  });

});
