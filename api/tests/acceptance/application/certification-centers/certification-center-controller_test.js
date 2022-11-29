const _ = require('lodash');

const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} = require('../../../test-helper');

const createServer = require('../../../../server');

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
          isSupervisorAccessEnabled: true,
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 2,
          name: 'Centres des tests pas moches',
          type: 'SCO',
          externalId: '222',
          isSupervisorAccessEnabled: false,
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
                'is-supervisor-access-enabled': true,
              },
              relationships: {
                habilitations: {
                  data: [
                    {
                      id: '12',
                      type: 'habilitations',
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
                'is-supervisor-access-enabled': false,
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
              type: 'habilitations',
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
    beforeEach(async function () {
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      request = {
        method: 'POST',
        url: '/api/admin/certification-centers',
        payload: {
          data: {
            type: 'certification-center',
            attributes: {
              name: 'Nouveau Centre de Certif',
              type: 'SCO',
              'is-supervisor-access-enabled': true,
            },
            relationships: {
              habilitations: {
                data: [
                  {
                    type: 'habilitations',
                    id: `${complementaryCertification.id}`,
                  },
                ],
              },
            },
          },
        },
      };

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('complementary-certification-habilitations').delete();
      await knex('certification-centers').delete();
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

      it('should return the certification center created', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.result.data.attributes.name).to.equal('Nouveau Centre de Certif');
        expect(response.result.data.attributes['is-supervisor-access-enabled']).to.equal(true);
        expect(response.result.data.id).to.be.ok;
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
        { id: 5, division: '2ndA', firstName: 'Arthur', lastName: 'Coucou' }
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
          { id: 5, division: '2ndA', firstName: 'Arthur', lastName: 'Coucou' }
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
          session
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
          certificationCenterMembership1.createdAt
        );

        expect(response.result.data[1].id).to.equal(certificationCenterMembership2.id.toString());
        expect(response.result.data[1].attributes['created-at']).to.deep.equal(
          certificationCenterMembership2.createdAt
        );

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

    afterEach(async function () {
      await knex('certification-center-memberships').delete();
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

  function _buildOrganizationLearners(organization, ...students) {
    const AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR = '2020-10-15';
    return students.map((student) =>
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        ...student,
        updatedAt: AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR,
      })
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
