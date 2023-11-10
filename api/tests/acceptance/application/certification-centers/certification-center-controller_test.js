import _ from 'lodash';

import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | API | Certification Center', function () {
  let server, request;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/certification-centers', function () {
    beforeEach(async function () {
      request = {
        method: 'GET',
        url: '/api/admin/certification-centers',
      };
    });

    context('when user is Super Admin', function () {
      beforeEach(function () {
        request.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return a list of certificationCenter, with their name and id', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'Centres des tests jolis',
          type: 'SUP',
          externalId: '12345',
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 2,
          name: 'Centres des tests pas moches',
          type: 'SCO',
          externalId: '222',
          createdAt: new Date('2020-01-05'),
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 12,
          label: 'Pix+Edu 1er degré',
          key: 'EDU_1ER_DEGRE',
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 1,
          complementaryCertificationId: 12,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              id: '1',
              type: 'certification-centers',
              attributes: {
                'created-at': new Date('2020-01-01'),
                'external-id': '12345',
                name: 'Centres des tests jolis',
                type: 'SUP',
              },
              relationships: {
                habilitations: {
                  data: [
                    {
                      id: '12',
                      type: 'complementary-certifications',
                    },
                  ],
                },
                'certification-center-memberships': {
                  links: {
                    related: '/api/certification-centers/1/certification-center-memberships',
                  },
                },
              },
            },
            {
              id: '2',
              type: 'certification-centers',
              attributes: {
                'created-at': new Date('2020-01-05'),
                'external-id': '222',
                name: 'Centres des tests pas moches',
                type: 'SCO',
              },
              relationships: {
                habilitations: {
                  data: [],
                },
                'certification-center-memberships': {
                  links: {
                    related: '/api/certification-centers/2/certification-center-memberships',
                  },
                },
              },
            },
          ],
          included: [
            {
              id: '12',
              type: 'complementary-certifications',
              attributes: {
                label: 'Pix+Edu 1er degré',
                key: 'EDU_1ER_DEGRE',
              },
            },
          ],
          meta: {
            page: 1,
            pageCount: 1,
            pageSize: 10,
            rowCount: 2,
          },
        });
      });
    });

    context('when user is not SuperAdmin', function () {
      beforeEach(function () {
        request.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', function () {
      it('should return 401 HTTP status code if user is not authenticated', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('POST /api/admin/certification-centers', function () {
    let complementaryCertification;

    beforeEach(async function () {
      // given
      complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      await databaseBuilder.commit();
    });
    afterEach(async function () {
      complementaryCertification = null;
    });

    context('when user is Super Admin', function () {
      it('returns 200 HTTP status with the certification center created', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/admin/certification-centers',
          headers: { authorization: generateValidRequestAuthorizationHeader() },
          payload: {
            data: {
              type: 'certification-center',
              attributes: {
                name: 'Nouveau Centre de Certif',
                type: 'SCO',
                'data-protection-officer-email': 'adrienne.quepourra@example.net',
              },
              relationships: {
                habilitations: {
                  data: [
                    {
                      type: 'complementary-certifications',
                      id: `${complementaryCertification.id}`,
                    },
                  ],
                },
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes.name).to.equal('Nouveau Centre de Certif');
        expect(response.result.data.attributes['data-protection-officer-email']).to.equal(
          'adrienne.quepourra@example.net',
        );
        expect(response.result.data.id).to.be.ok;
      });
    });

    context('when user is not SuperAdmin', function () {
      it('should return 403 HTTP status code ', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/admin/certification-centers',
          headers: { authorization: generateValidRequestAuthorizationHeader(111) },
          payload: {
            data: {
              type: 'certification-center',
              attributes: {
                name: 'Nouveau Centre de Certif',
                type: 'SCO',
              },
              relationships: {
                habilitations: {
                  data: [
                    {
                      type: 'complementary-certifications',
                      id: `${complementaryCertification.id}`,
                    },
                  ],
                },
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/admin/certification-centers/{id}', function () {
    let expectedCertificationCenter;
    beforeEach(async function () {
      expectedCertificationCenter = databaseBuilder.factory.buildCertificationCenter({});
      databaseBuilder.factory.buildCertificationCenter({});
      await databaseBuilder.commit();
      request = {
        method: 'GET',
        url: '/api/admin/certification-centers/' + expectedCertificationCenter.id,
      };
    });

    context('when user is Super Admin', function () {
      beforeEach(function () {
        request.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return 200 HTTP status', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the certification center asked', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.result.data.id).to.equal(expectedCertificationCenter.id.toString());
        expect(response.result.data.attributes.name).to.equal(expectedCertificationCenter.name);
      });

      it('should return notFoundError when the certificationCenter not exist', async function () {
        // given
        request.url = '/api/admin/certification-centers/112334';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.result.errors[0].title).to.equal('Not Found');
        expect(response.result.errors[0].detail).to.equal('Certification center with id: 112334 not found');
      });
    });

    context('when user is not SuperAdmin', function () {
      beforeEach(function () {
        request.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', function () {
      it('should return 401 HTTP status code if user is not authenticated', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('GET /api/certification-centers/{certificationCenterId}/sessions/{sessionId}/divisions', function () {
    it('should return the divisions', async function () {
      // given
      const externalId = 'anExternalId';
      const { certificationCenter, user } = _buildUserWithCertificationCenterMemberShip(externalId);
      const organization = databaseBuilder.factory.buildOrganization({ externalId, type: 'SCO' });

      _buildOrganizationLearners(
        organization,
        { id: 1, division: '2ndB', firstName: 'Laura', lastName: 'Certif4Ever' },
        { id: 2, division: '2ndA', firstName: 'Laura', lastName: 'Booooo' },
        { id: 3, division: '2ndA', firstName: 'Laura', lastName: 'aaaaa' },
        { id: 4, division: '2ndA', firstName: 'Bart', lastName: 'Coucou' },
        { id: 5, division: '2ndA', firstName: 'Arthur', lastName: 'Coucou' },
      );
      await databaseBuilder.commit();

      const request = {
        method: 'GET',
        url: '/api/certification-centers/' + certificationCenter.id + '/divisions',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(_.map(response.result.data, 'id')).to.deep.equal(['2ndA', '2ndB']);
    });
  });

  describe('GET /api/certification-centers/{certificationCenterId}/sessions/{sessionId}/students', function () {
    let request;
    const externalId = 'XXXX';

    function _buildOrganizationLearnersWithConnectedUserRequest(user, certificationCenter, session) {
      return {
        method: 'GET',
        url:
          '/api/certification-centers/' +
          certificationCenter.id +
          '/sessions/' +
          session.id +
          '/students?page[size]=10&page[number]=1',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    }
    function _buildOrganizationLearnersNotConnectedUserRequest(certificationCenter, session) {
      return {
        method: 'GET',
        url:
          '/api/certification-centers/' +
          certificationCenter.id +
          '/sessions/' +
          session.id +
          '/students?page[size]=10&page[number]=1',
      };
    }

    context('when user is connected', function () {
      it('should return 200 HTTP status', async function () {
        // given
        const { certificationCenter, user } = _buildUserWithCertificationCenterMemberShip(externalId);
        const organization = databaseBuilder.factory.buildOrganization({ externalId });
        const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
        _buildOrganizationLearners(organization, { firstName: 'Laura', lastName: 'certifForEver', division: '2ndB' });
        await databaseBuilder.commit();

        const request = _buildOrganizationLearnersWithConnectedUserRequest(user, certificationCenter, session);

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the organization learners asked', async function () {
        // given
        const { certificationCenter, user } = _buildUserWithCertificationCenterMemberShip(externalId);
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId });
        const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
        _buildOrganizationLearners(
          organization,
          { id: 1, division: '2ndB', firstName: 'Laura', lastName: 'Certif4Ever' },
          { id: 2, division: '2ndA', firstName: 'Laura', lastName: 'Booooo' },
          { id: 3, division: '2ndA', firstName: 'Laura', lastName: 'aaaaa' },
          { id: 4, division: '2ndA', firstName: 'Bart', lastName: 'Coucou' },
          { id: 5, division: '2ndA', firstName: 'Arthur', lastName: 'Coucou' },
        );
        await databaseBuilder.commit();

        const request = _buildOrganizationLearnersWithConnectedUserRequest(user, certificationCenter, session);

        // when
        const response = await server.inject(request);

        // then
        expect(_.map(response.result.data, 'id')).to.deep.equal(['3', '2', '5', '4', '1']);
      });
    });

    context('when user is not connected', function () {
      it('should return 401 HTTP status code if user is not authenticated', async function () {
        // given
        _buildUserWithCertificationCenterMemberShip(externalId);
        databaseBuilder.factory.buildOrganization({ externalId });
        const certificationCenterWhereUserDoesNotHaveAccess = databaseBuilder.factory.buildCertificationCenter({
          externalId,
        });
        const session = databaseBuilder.factory.buildSession({
          certificationCenterId: certificationCenterWhereUserDoesNotHaveAccess.id,
        });
        await databaseBuilder.commit();

        request = _buildOrganizationLearnersNotConnectedUserRequest(
          certificationCenterWhereUserDoesNotHaveAccess,
          session,
        );

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('GET /api/admin/certification-centers/{id}/certification-center-memberships', function () {
    context('when certification center membership is linked to the certification center', function () {
      it('should return 200 HTTP status', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const user1 = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          userId: user1.id,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          headers: {
            authorization: generateValidRequestAuthorizationHeader(),
          },
          method: 'GET',
          url: `/api/admin/certification-centers/${certificationCenter.id}/certification-center-memberships`,
        });

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return certification center memberships', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const user1 = databaseBuilder.factory.buildUser();
        const user2 = databaseBuilder.factory.buildUser();
        const certificationCenterMembership1 = databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          userId: user1.id,
        });
        const certificationCenterMembership2 = databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          userId: user2.id,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          headers: {
            authorization: generateValidRequestAuthorizationHeader(),
          },
          method: 'GET',
          url: `/api/admin/certification-centers/${certificationCenter.id}/certification-center-memberships`,
        });

        // then
        expect(response.result.data[0].id).to.equal(certificationCenterMembership1.id.toString());
        expect(response.result.data[0].attributes['created-at']).to.deep.equal(
          certificationCenterMembership1.createdAt,
        );
        expect(response.result.data[0].attributes['role']).to.deep.equal(certificationCenterMembership1.role);

        expect(response.result.data[1].id).to.equal(certificationCenterMembership2.id.toString());
        expect(response.result.data[1].attributes['created-at']).to.deep.equal(
          certificationCenterMembership2.createdAt,
        );
        expect(response.result.data[1].attributes['role']).to.deep.equal(certificationCenterMembership2.role);

        const expectedIncluded = [
          {
            id: certificationCenter.id.toString(),
            type: 'certificationCenters',
            attributes: {
              name: certificationCenter.name,
              type: certificationCenter.type,
            },
            relationships: {
              sessions: {
                links: {
                  related: `/api/certification-centers/${certificationCenter.id}/sessions`,
                },
              },
            },
          },
          {
            id: user1.id.toString(),
            type: 'users',
            attributes: {
              email: user1.email,
              'first-name': user1.firstName,
              'last-name': user1.lastName,
            },
          },
          {
            id: user2.id.toString(),
            type: 'users',
            attributes: {
              email: user2.email,
              'first-name': user2.firstName,
              'last-name': user2.lastName,
            },
          },
        ];
        expect(response.result.included).to.deep.equal(expectedIncluded);
      });
    });
  });

  describe('GET /api/certification-centers/{id}/session-summaries', function () {
    it('should return 200 http status with serialized sessions summaries', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildSession({
        id: 123,
        address: 'ici',
        room: 'labas',
        date: '2021-05-05',
        time: '17:00:00',
        examiner: 'Jeanine',
        finalizedAt: null,
        publishedAt: null,
        certificationCenterId,
      });
      databaseBuilder.factory.buildCertificationCandidate({ sessionId: 123 });
      await databaseBuilder.commit();
      const request = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
        method: 'GET',
        url: `/api/certification-centers/${certificationCenterId}/session-summaries?page[number]=1&page[size]=10`,
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([
        {
          type: 'session-summaries',
          id: '123',
          attributes: {
            address: 'ici',
            room: 'labas',
            date: '2021-05-05',
            time: '17:00:00',
            examiner: 'Jeanine',
            'enrolled-candidates-count': 1,
            'effective-candidates-count': 0,
            status: 'created',
          },
        },
      ]);
    });
  });

  describe('GET /api/certifications-centers/{certificationCenterId}/invitations', function () {
    let certificationCenterId, userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    });

    context('When user is admin of the certification center', function () {
      it('returns pending invitations from certification center', async function () {
        // given
        const invitation = databaseBuilder.factory.buildCertificationCenterInvitation({ certificationCenterId });
        const invitation2 = databaseBuilder.factory.buildCertificationCenterInvitation({
          certificationCenterId,
          code: 'WXCVBN',
          email: 'test@example.net',
        });
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'ADMIN' });

        await databaseBuilder.commit();

        request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          method: 'GET',
          url: `/api/certification-centers/${certificationCenterId}/invitations`,
          payload: { certificationCenterId },
        };

        // when
        const response = await server.inject(request);
        const responseIds = response.result.data.map(
          (certificationCenterInvitation) => certificationCenterInvitation.id,
        );

        // then
        expect(response.statusCode).to.equal(200);
        expect(responseIds).to.have.members([invitation.id.toString(), invitation2.id.toString()]);
      });
    });

    context('When user is not admin of the certification center', function () {
      it('returns an 403 HTTP error code', async function () {
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'MEMBER' });

        await databaseBuilder.commit();

        request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          method: 'GET',
          url: `/api/certification-centers/${certificationCenterId}/invitations`,
          payload: { certificationCenterId },
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/certification-centers/{id}/invitations', function () {
    let certificationCenterId, userId;
    const CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME = 'certification-center-invitations';

    beforeEach(async function () {
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();
    });

    context('When user is not admin of the certification center', function () {
      it('returns an 403 HTTP error code', async function () {
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'MEMBER' });

        await databaseBuilder.commit();

        request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          method: 'POST',
          url: `/api/certification-centers/${certificationCenterId}/invitations`,
          payload: {},
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('When user is admin of the certification center', function () {
      it('returns 204 HTTP status code', async function () {
        const emails = ['dev@example.net', 'com@example.net'];
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'ADMIN' });

        await databaseBuilder.commit();

        request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          method: 'POST',
          url: `/api/certification-centers/${certificationCenterId}/invitations`,
          payload: {
            data: {
              attributes: {
                emails,
              },
            },
          },
        };

        // when
        const response = await server.inject(request);

        // then
        const certificationCenterInvitations = await knex(CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME)
          .where({ certificationCenterId })
          .whereIn('email', emails);
        expect(response.statusCode).to.equal(204);
        expect(certificationCenterInvitations.length).to.equal(2);
      });
    });
  });

  describe('POST /api/admin/certification-centers/{certificationCenterId}/certification-center-memberships', function () {
    let certificationCenterId;
    let email;

    beforeEach(async function () {
      email = 'user@example.net';

      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildUser({ email });

      request = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(),
        },
        method: 'POST',
        url: `/api/admin/certification-centers/${certificationCenterId}/certification-center-memberships`,
        payload: { email },
      };

      await databaseBuilder.commit();
    });

    it('should return 201 HTTP status', async function () {
      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(201);
    });

    context('when user is not SuperAdmin', function () {
      it('should return 403 HTTP status code ', async function () {
        // given
        request.headers.authorization = generateValidRequestAuthorizationHeader(1111);

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not authenticated', function () {
      it('should return 401 HTTP status code', async function () {
        // given
        request.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when certification center does not exist', function () {
      it('should return 404 HTTP status code', async function () {
        // given
        request.url = '/api/admin/certification-centers/1/certification-center-memberships';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context("when user's email does not exist", function () {
      it('should return 404 HTTP status code', async function () {
        // given
        request.payload.email = 'notexist@example.net';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when user is already member of the certification center', function () {
      it('should return 412 HTTP status code', async function () {
        // given
        email = 'alreadyExist@example.net';
        const userId = databaseBuilder.factory.buildUser({ email }).id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId,
          userId,
        });
        request.payload.email = email;

        await databaseBuilder.commit();

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });
  });

  describe('POST /api/certif/certification-centers/{certificationCenterId}/update-referer', function () {
    it('should return 204 HTTP status', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterMemberId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
        isReferer: false,
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: certificationCenterMemberId,
        certificationCenterId,
        isReferer: false,
      });
      await databaseBuilder.commit();

      const payload = {
        data: {
          attributes: {
            isReferer: true,
            userId,
          },
        },
      };

      const options = {
        method: 'POST',
        url: `/api/certif/certification-centers/${certificationCenterId}/update-referer`,
        payload,
        headers: { authorization: generateValidRequestAuthorizationHeader(certificationCenterMemberId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('POST /api/certification-centers/{certificationCenterId}/session', function () {
    describe('when certification center is not V3 certification pilot center', function () {
      it('should return a 200 HTTP status with a V2 session', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId,
        });
        await databaseBuilder.commit();

        const payload = {
          data: {
            attributes: {
              address: 'site',
              'access-code': null,
              date: '2023-06-17',
              time: '12:00',
              description: null,
              examiner: 'surveillant',
              room: 'salle',
              'certification-center-id': certificationCenterId,
            },
            type: 'sessions',
          },
        };

        const options = {
          method: 'POST',
          url: `/api/certification-centers/${certificationCenterId}/session`,
          payload,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const [session] = await knex('sessions');
        expect(session.version).to.equal(2);
      });
    });

    describe('when certification center is a V3 certification pilot center', function () {
      it('should return a 200 HTTP status with a V3 session', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ isV3Pilot: true }).id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId,
        });
        await databaseBuilder.commit();

        const payload = {
          data: {
            attributes: {
              address: 'site',
              'access-code': null,
              date: '2023-06-17',
              time: '12:00',
              description: null,
              examiner: 'surveillant',
              room: 'salle',
              status: null,
              'examiner-global-comment': null,
              'supervisor-password': null,
              'has-supervisor-access': false,
              'has-some-clea-acquired': false,
              'has-incident': false,
              'has-joining-issue': false,
              'certification-center-id': certificationCenterId,
            },
            type: 'sessions',
          },
        };

        const options = {
          method: 'POST',
          url: `/api/certification-centers/${certificationCenterId}/session`,
          payload,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const [session] = await knex('sessions');
        expect(session.version).to.equal(3);
      });
    });
  });

  function _buildOrganizationLearners(organization, ...students) {
    const AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR = '2020-10-15';
    return students.map((student) =>
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        ...student,
        updatedAt: AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR,
      }),
    );
  }

  function _buildUserWithCertificationCenterMemberShip(certificationCenterExternalId) {
    const user = databaseBuilder.factory.buildUser({});
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
      externalId: certificationCenterExternalId,
      type: 'SCO',
    });
    databaseBuilder.factory.buildCertificationCenterMembership({
      certificationCenterId: certificationCenter.id,
      userId: user.id,
    });
    return { user, certificationCenter };
  }
});
