const _ = require('lodash');

const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRolePixMaster,
  knex,
} = require('../../test-helper');

const createServer = require('../../../server');

describe('Acceptance | API | Certification Center', () => {

  let server, request;

  beforeEach(async () => {
    server = await createServer();
    await insertUserWithRolePixMaster();
  });

  describe('GET /api/certification-centers', () => {
    beforeEach(async () => {
      request = {
        method: 'GET',
        url: '/api/certification-centers',
      };

      _.times(5, databaseBuilder.factory.buildCertificationCenter);
      await databaseBuilder.commit();
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        request.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return 200 HTTP status', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a list of certificationCenter, with their name and id', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.result.data).to.have.lengthOf(5);
        expect(_.keys(response.result.data[0].attributes)).to.have.members(['id', 'name', 'type', 'external-id', 'created-at']);
      });
    });

    context('when user is not PixMaster', () => {
      beforeEach(() => {
        request.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('POST /api/certification-centers', () => {
    beforeEach(() => {
      request = {
        method: 'POST',
        url: '/api/certification-centers',
        payload: {
          data: {
            type: 'certification-center',
            attributes: {
              name: 'Nouveau Centre de Certif',
              type: 'SCO',
            },
          },
        },
      };
    });

    afterEach(async () => {
      await knex('certification-centers').delete();
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        request.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return 200 HTTP status', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the certification center created', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.result.data.attributes.name).to.equal('Nouveau Centre de Certif');
        expect(response.result.data.attributes.id).to.be.ok;
      });

    });

    context('when user is not PixMaster', () => {
      beforeEach(() => {
        request.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

  });

  describe('GET /api/certification-centers/{id}', () => {
    let expectedCertificationCenter;
    beforeEach(async() => {
      expectedCertificationCenter = databaseBuilder.factory.buildCertificationCenter({});
      databaseBuilder.factory.buildCertificationCenter({});
      await databaseBuilder.commit();
      request = {
        method: 'GET',
        url: '/api/certification-centers/' + expectedCertificationCenter.id,
      };
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        request.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return 200 HTTP status', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the certification center asked', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.result.data.id).to.equal(expectedCertificationCenter.id.toString());
        expect(response.result.data.attributes.name).to.equal(expectedCertificationCenter.name);
      });

      it('should return notFoundError when the certificationCenter not exist', async () => {
        // given
        request.url = '/api/certification-centers/112334';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.result.errors[0].title).to.equal('Not Found');
        expect(response.result.errors[0].detail).to.equal('Certification center with id: 112334 not found');
      });

    });

    context('when user is not PixMaster', () => {
      beforeEach(() => {
        request.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('GET /api/certification-centers/{certificationCenterId}/sessions/{sessionId}/divisions', () => {
    it('should return the divisions', async () => {
      // given
      const externalId = 'anExternalId';
      const { certificationCenter, user } = _buildUserWithCertificationCenterMemberShip(externalId);
      const organization = databaseBuilder.factory.buildOrganization({ externalId });

      _buildSchoolingRegistrations(
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

  describe('GET /api/certification-centers/{certificationCenterId}/sessions/{sessionId}/students', () => {
    let request;
    const externalId = 'XXXX';

    function _buildSchoolinRegistrationsWithConnectedUserRequest(user, certificationCenter, session) {
      return {
        method: 'GET',
        url: '/api/certification-centers/' + certificationCenter.id + '/sessions/' + session.id + '/students?page[size]=10&page[number]=1',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    }
    function _buildSchoolinRegistrationsNotConnectedUserRequest(certificationCenter, session) {
      return {
        method: 'GET',
        url: '/api/certification-centers/' + certificationCenter.id + '/sessions/' + session.id + '/students?page[size]=10&page[number]=1',
      };
    }

    context('when user is connected', () => {

      it('should return 200 HTTP status', async () => {
        // given
        const { certificationCenter, user } = _buildUserWithCertificationCenterMemberShip(externalId);
        const organization = databaseBuilder.factory.buildOrganization({ externalId });
        const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
        _buildSchoolingRegistrations(organization, { firstName: 'Laura', lastName: 'certifForEver', division: '2ndB' });
        await databaseBuilder.commit();

        const request = _buildSchoolinRegistrationsWithConnectedUserRequest(user, certificationCenter, session);

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the schooling registrations asked', async () => {
        // given
        const { certificationCenter, user } = _buildUserWithCertificationCenterMemberShip(externalId);
        const organization = databaseBuilder.factory.buildOrganization({ externalId });
        const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
        _buildSchoolingRegistrations(
          organization,
          { id: 1, division: '2ndB', firstName: 'Laura', lastName: 'Certif4Ever' },
          { id: 2, division: '2ndA', firstName: 'Laura', lastName: 'Booooo' },
          { id: 3, division: '2ndA', firstName: 'Laura', lastName: 'aaaaa' },
          { id: 4, division: '2ndA', firstName: 'Bart', lastName: 'Coucou' },
          { id: 5, division: '2ndA', firstName: 'Arthur', lastName: 'Coucou' },
        );
        await databaseBuilder.commit();

        const request = _buildSchoolinRegistrationsWithConnectedUserRequest(user, certificationCenter, session);

        // when
        const response = await server.inject(request);

        // then
        expect(_.map(response.result.data, 'id')).to.deep.equal(['3', '2', '5', '4', '1']);
      });

    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', async() => {
        // given
        _buildUserWithCertificationCenterMemberShip(externalId);
        databaseBuilder.factory.buildOrganization({ externalId });
        const certificationCenterWhereUserDoesNotHaveAccess = databaseBuilder.factory.buildCertificationCenter({ externalId });
        const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenterWhereUserDoesNotHaveAccess.id });
        await databaseBuilder.commit();

        request = _buildSchoolinRegistrationsNotConnectedUserRequest(certificationCenterWhereUserDoesNotHaveAccess, session);

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('GET /api/certification-centers/{id}/sessions', () => {
    let certificationCenter;
    let expectedSessions;
    let user, otherUser;

    beforeEach(async() => {
      certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
      user = databaseBuilder.factory.buildUser({});
      otherUser = databaseBuilder.factory.buildUser({});
      databaseBuilder.factory.buildCertificationCenterMembership({ certificationCenterId: certificationCenter.id, userId: user.id });
      expectedSessions = [
        databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id }),
        databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id }),
      ];
      databaseBuilder.factory.buildSession();
      await databaseBuilder.commit();
      request = {
        method: 'GET',
        url: '/api/certification-centers/' + certificationCenter.id + '/sessions',
      };
    });

    context('when user is linked to the certification center', () => {
      beforeEach(() => {
        request.headers = { authorization: generateValidRequestAuthorizationHeader(user.id) };
      });

      it('should return 200 HTTP status', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the list of sessions', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.result.data).to.have.lengthOf(expectedSessions.length);
        expect(response.result.data.map((sessions) => sessions.id))
          .to.have.members(expectedSessions.map((sessions) => sessions.id.toString()));
      });

    });

    context('when user is not linked to certification center', () => {
      beforeEach(async () => {
        request.headers = { authorization: generateValidRequestAuthorizationHeader(otherUser.id) };
      });

      it('should return 403 HTTP status code ', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('GET /api/certification-centers/{id}/certification-center-memberships', () => {

    let certificationCenter;
    let certificationCenterMembership1;
    let certificationCenterMembership2;
    let user1;
    let user2;

    beforeEach(async () => {
      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      user1 = databaseBuilder.factory.buildUser();
      user2 = databaseBuilder.factory.buildUser();
      certificationCenterMembership1 = databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: user1.id,
      });
      certificationCenterMembership2 = databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: user2.id,
      });
      await databaseBuilder.commit();

      request = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(),
        },
        method: 'GET',
        url: `/api/certification-centers/${certificationCenter.id}/certification-center-memberships`,
      };
    });

    context('when certification center membership is linked to the certification center', () => {

      it('should return 200 HTTP status', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return certification center memberships', async () => {
        // given
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

        // when
        const response = await server.inject(request);

        // then
        expect(response.result.data[0].id)
          .to.equal(certificationCenterMembership1.id.toString());
        expect(response.result.data[0].attributes['created-at'])
          .to.deep.equal(certificationCenterMembership1.createdAt);

        expect(response.result.data[1].id)
          .to.equal(certificationCenterMembership2.id.toString());
        expect(response.result.data[1].attributes['created-at'])
          .to.deep.equal(certificationCenterMembership2.createdAt);

        expect(response.result.included).to.deep.equal(expectedIncluded);
      });
    });
  });

  describe('POST /api/certification-centers/{certificationCenterId}/certification-center-memberships', () => {

    let certificationCenterId;
    let email;

    beforeEach(async () => {
      email = 'user@example.net';

      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildUser({ email });

      request = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(),
        },
        method: 'POST',
        url: `/api/certification-centers/${certificationCenterId}/certification-center-memberships`,
        payload: { email },
      };

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('certification-center-memberships').delete();
    });

    it('should return 201 HTTP status', async () => {
      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(201);
    });

    context('when user is not PixMaster', () => {

      it('should return 403 HTTP status code ', async () => {
        // given
        request.headers.authorization = generateValidRequestAuthorizationHeader(1111);

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not authenticated', () => {

      it('should return 401 HTTP status code', async () => {
        // given
        request.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when certification center does not exist', () => {

      it('should return 404 HTTP status code', async () => {
        // given
        request.url = '/api/certification-centers/1/certification-center-memberships';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when user\'s email does not exist', () => {

      it('should return 404 HTTP status code', async () => {
        // given
        request.payload.email = 'notexist@example.net';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when user is already member of the certification center', () => {

      it('should return 412 HTTP status code', async () => {
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

  function _buildSchoolingRegistrations(organization, ...students) {
    return students.map((student) => databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, ...student }));
  }

  function _buildUserWithCertificationCenterMemberShip(certificationCenterExternalId) {
    const user = databaseBuilder.factory.buildUser({});
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ externalId: certificationCenterExternalId });
    databaseBuilder.factory.buildCertificationCenterMembership({
      certificationCenterId: certificationCenter.id,
      userId: user.id,
    });
    return { user, certificationCenter };
  }

});
