const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-get-jury-session', () => {

  let server, options;

  beforeEach(async () => {
    server = await createServer();
    await insertUserWithRolePixMaster();
  });

  describe('GET /api/jury/sessions/{id}', () => {
    let expectedJurySession;

    beforeEach(() => {
      const assignedCertificationOfficerId = databaseBuilder.factory.buildUser({ firstName: 'Pix', lastName: 'Doe' }).id;
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ type: 'SCO' });
      expectedJurySession = databaseBuilder.factory.buildSession({
        assignedCertificationOfficerId,
        certificationCenterId: certificationCenter.id,
        certificationCenter: certificationCenter.name,
      });
      databaseBuilder.factory.buildSession();
      options = {
        method: 'GET',
        url: `/api/jury/sessions/${expectedJurySession.id}`,
      };

      return databaseBuilder.commit();
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return a 200 status code response with JSON API serialized', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('sessions');
        expect(parseInt(response.result.data.id)).to.equal(expectedJurySession.id);
        expect(response.result.data.attributes['certification-center-name']).to.equal(expectedJurySession.certificationCenter);
        expect(response.result.data.attributes['certification-center-type']).to.equal('SCO');
        expect(response.result.data.attributes['address']).to.equal(expectedJurySession.address);
        expect(response.result.data.attributes['room']).to.equal(expectedJurySession.room);
        expect(response.result.data.attributes['examiner']).to.equal(expectedJurySession.examiner);
        expect(response.result.data.attributes['date']).to.equal(expectedJurySession.date);
        expect(response.result.data.attributes['time']).to.equal(expectedJurySession.time);
        expect(response.result.data.attributes['access-code']).to.equal(expectedJurySession.accessCode);
        expect(response.result.data.attributes['description']).to.equal(expectedJurySession.description);
        expect(response.result.data.attributes['examiner-global-comment']).to.equal(expectedJurySession.examinerGlobalComment);
        expect(response.result.data.attributes['finalized-at']).to.equal(expectedJurySession.finalizedAt);
        expect(response.result.data.attributes['results-sent-to-prescriber-at']).to.equal(expectedJurySession.resultsSentToPrescriberAt);
        expect(response.result.data.attributes['published-at']).to.equal(expectedJurySession.publishedAt);
        expect(parseInt(response.result.included[0].id)).to.equal(expectedJurySession.assignedCertificationOfficerId);
        expect(response.result.included[0].attributes['first-name']).to.equal('Pix');
        expect(response.result.included[0].attributes['last-name']).to.equal('Doe');
      });
    });

    context('when user is not PixMaster', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', () => {

      it('should return 401 HTTP status code if user is not authenticated', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
