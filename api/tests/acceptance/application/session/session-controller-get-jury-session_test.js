const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-get-jury-session', function () {
  let server, options;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/admin/sessions/{id}', function () {
    let expectedJurySession;
    let certificationCenter;

    beforeEach(function () {
      const assignedCertificationOfficerId = databaseBuilder.factory.buildUser({
        firstName: 'Pix',
        lastName: 'Doe',
      }).id;
      certificationCenter = databaseBuilder.factory.buildCertificationCenter({ type: 'SCO', externalId: 'EXT_ID' });
      expectedJurySession = databaseBuilder.factory.buildSession({
        assignedCertificationOfficerId,
        certificationCenterId: certificationCenter.id,
        certificationCenter: certificationCenter.name,
      });
      databaseBuilder.factory.buildSupervisorAccess({ sessionId: expectedJurySession.id });
      databaseBuilder.factory.buildSession();
      options = {
        method: 'GET',
        url: `/api/admin/sessions/${expectedJurySession.id}`,
      };

      return databaseBuilder.commit();
    });

    context('when user is Super Admin', function () {
      beforeEach(function () {
        options.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return a 200 status code response with JSON API serialized', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('sessions');
        expect(parseInt(response.result.data.id)).to.equal(expectedJurySession.id);
        expect(response.result.data.attributes['certification-center-name']).to.equal(
          expectedJurySession.certificationCenter
        );
        expect(response.result.data.attributes['certification-center-type']).to.equal('SCO');
        expect(response.result.data.attributes['certification-center-external-id']).to.equal(
          certificationCenter.externalId
        );
        expect(response.result.data.attributes['address']).to.equal(expectedJurySession.address);
        expect(response.result.data.attributes['room']).to.equal(expectedJurySession.room);
        expect(response.result.data.attributes['examiner']).to.equal(expectedJurySession.examiner);
        expect(response.result.data.attributes['date']).to.equal(expectedJurySession.date);
        expect(response.result.data.attributes['time']).to.equal(expectedJurySession.time);
        expect(response.result.data.attributes['access-code']).to.equal(expectedJurySession.accessCode);
        expect(response.result.data.attributes['description']).to.equal(expectedJurySession.description);
        expect(response.result.data.attributes['examiner-global-comment']).to.equal(
          expectedJurySession.examinerGlobalComment
        );
        expect(response.result.data.attributes['finalized-at']).to.equal(expectedJurySession.finalizedAt);
        expect(response.result.data.attributes['results-sent-to-prescriber-at']).to.equal(
          expectedJurySession.resultsSentToPrescriberAt
        );
        expect(response.result.data.attributes['published-at']).to.equal(expectedJurySession.publishedAt);
        expect(response.result.data.attributes['has-supervisor-access']).to.be.true;
        expect(response.result.data.attributes['has-incident']).to.equal(false);
        expect(response.result.data.attributes['has-joining-issue']).to.equal(false);
        expect(parseInt(response.result.included[0].id)).to.equal(expectedJurySession.assignedCertificationOfficerId);
        expect(response.result.included[0].attributes['first-name']).to.equal('Pix');
        expect(response.result.included[0].attributes['last-name']).to.equal('Doe');
      });
    });

    context('when user is not SuperAdmin', function () {
      beforeEach(function () {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', function () {
      it('should return 401 HTTP status code if user is not authenticated', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
