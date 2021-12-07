const { expect, generateValidRequestAuthorizationHeader, databaseBuilder, sinon } = require('../../../test-helper');
const createServer = require('../../../../server');
const { featureToggles } = require('../../../../lib/config');

describe('POST /api/certification-candidates/:id/authorize-to-start', function () {
  context('when user is authenticated', function () {
    describe('when FT_END_TEST_SCREEN_REMOVAL_ENABLED is enabled', function () {
      it('should return a 204 status code', async function () {
        // given
        sinon.stub(featureToggles, 'isEndTestScreenRemovalEnabled').value(true);

        const server = await createServer();
        const userId = databaseBuilder.factory.buildUser().id;
        const session = databaseBuilder.factory.buildSession({ publishedAt: null });
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
        });
        await databaseBuilder.commit();
        const options = {
          method: 'POST',
          url: `/api/certification-candidates/${candidate.id}/authorize-to-start`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId, 'pix-certif') },
          payload: { 'authorized-to-start': true },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
