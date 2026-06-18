import { createServer } from '../../../../../server.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Session Management | Acceptance | Application | Route | Session', function () {
  let server, options;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/sessions', function () {
    beforeEach(function () {
      options = {
        method: 'GET',
        url: '/api/admin/sessions',
        payload: {},
      };

      databaseBuilder.factory.buildSession({ id: 121 });
      databaseBuilder.factory.buildSession({ id: 333 });
      return databaseBuilder.commit();
    });

    context('when user is Super Admin', function () {
      beforeEach(async function () {
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        await databaseBuilder.commit();
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id });
      });

      it('should return a 200 status code response with JSON API serialized', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(2);
        expect(response.result.data[0].type).to.equal('sessions');
      });

      it('should return a 200 status code with paginated and filtered data', async function () {
        // given
        options.url = '/api/admin/sessions?filter[id]=121&page[number]=1&page[size]=2';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('sessions');
      });

      it('should return a 200 status code with empty result', async function () {
        // given
        options.url = '/api/admin/sessions?filter[id]=4&page[number]=1&page[size]=1';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(0);
      });

      it('should signal an entity validation error for an ID that is too large', async function () {
        // given
        options.url = '/api/admin/sessions?filter[id]=2147483648';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should signal an entity validation error for an ID that is too small', async function () {
        // given
        options.url = '/api/admin/sessions?filter[id]=-2147483649';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });

    context('when user is not SuperAdmin', function () {
      beforeEach(function () {
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: 1111 });
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

  describe('GET /api/admin/sessions/{sessionId}', function () {
    let expectedJurySession;
    let certificationCenter;

    beforeEach(async function () {
      const assignedCertificationOfficerId = databaseBuilder.factory.buildUser({
        id: 100002,
        firstName: 'Pix',
        lastName: 'Doe',
      }).id;
      certificationCenter = databaseBuilder.factory.buildCertificationCenter({
        id: 100003,
        type: 'SCO',
        externalId: 'EXT_ID',
      });
      expectedJurySession = databaseBuilder.factory.buildSession({
        id: 100004,
        assignedCertificationOfficerId,
        certificationCenterId: certificationCenter.id,
        certificationCenter: certificationCenter.name,
      });
      databaseBuilder.factory.buildInvigilatorAccess({ sessionId: expectedJurySession.id });
      databaseBuilder.factory.buildSession({ id: 1000099 });
      options = {
        method: 'GET',
        url: `/api/admin/sessions/${expectedJurySession.id}`,
      };
      return databaseBuilder.commit();
    });

    context('when user is Super Admin', function () {
      beforeEach(async function () {
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        await databaseBuilder.commit();
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id });
      });

      it('should return a 200 status code response with JSON API serialized', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          included: [{ type: 'user', id: '100002', attributes: { 'first-name': 'Pix', 'last-name': 'Doe' } }],
          data: {
            type: 'sessions',
            id: '100004',
            attributes: {
              'certification-center-name': 'some name',
              'certification-center-type': 'SCO',
              'certification-center-id': 100003,
              'certification-center-external-id': 'EXT_ID',
              address: '3 rue des églantines',
              room: 'B315',
              examiner: 'Ginette',
              date: '2020-01-15',
              time: '15:30:00',
              'access-code': 'FMKP39',
              status: 'in_process',
              description: 'La session se déroule dans le jardin',
              'examiner-global-comment': '',
              'created-at': new Date('2020-01-01'),
              'finalized-at': null,
              'results-sent-to-prescriber-at': null,
              'published-at': null,
              'jury-comment': null,
              'jury-commented-at': null,
              'has-joining-issue': false,
              'has-incident': false,
              'number-of-impactfull-issue-reports': 0,
              'number-of-scoring-errors': 0,
              'number-of-started-certifications': 0,
              'total-number-of-issue-reports': 0,
              version: 2,
            },
            relationships: {
              'assigned-certification-officer': { data: { type: 'user', id: '100002' } },
              'jury-comment-author': { data: null },
              'jury-certification-summaries': {
                links: { related: '/api/admin/sessions/100004/jury-certification-summaries' },
              },
            },
          },
        });
      });
    });

    context('when user is not SuperAdmin', function () {
      beforeEach(function () {
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: 1111 });
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

  describe('GET /sessions/{sessionId}/management', function () {
    it('should respond with 200', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;

      const { id: certificationCenterId, name: certificationCenter } = databaseBuilder.factory.buildCertificationCenter(
        { id: 123 },
      );

      const sessionId = databaseBuilder.factory.buildSession({
        id: 456,
        certificationCenterId,
        certificationCenter,
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

      await databaseBuilder.commit();
      const options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/sessions/${sessionId}/management`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(response.payload)).to.deep.equal({
        data: {
          type: 'session-managements',
          id: '456',
          relationships: {
            'certification-reports': {
              links: {
                related: '/api/sessions/456/certification-reports',
              },
            },
          },
          attributes: {
            status: 'created',
            'examiner-global-comment': null,
            'has-incident': false,
            'has-joining-issue': false,
            'finalized-at': null,
            'results-sent-to-prescriber-at': null,
            'published-at': null,
            'has-some-clea-acquired': false,
            version: 3,
          },
        },
      });
    });
  });
});
