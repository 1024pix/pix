const _ = require('lodash');
const {
  expect, generateValidRequestAuthorizationHeader,
  insertUserWithRolePixMaster, databaseBuilder, knex,
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

  describe('GET /api/certification-centers/{certificationCenterId}/session/{sessionId}/students', () => {let request;
    const externalId = 'XXXX';

    function _buildSchoolinRegistrationsWithConnectedUserRequest(user, certificationCenter, session) {
      return {
        method: 'GET',
        url: '/api/certification-centers/' + certificationCenter.id + '/session/' + session.id + '/students',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    }
    function _buildSchoolinRegistrationsNotConnectedUserRequest(certificationCenter, session) {
      return {
        method: 'GET',
        url: '/api/certification-centers/' + certificationCenter.id + '/session/' + session.id + '/students',
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

      context('when the certification center does not exist', () => {

        it('should return Forbidden Access when the certificationCenter does not exist', async () => {
          // given
          const { user } = _buildUserWithCertificationCenterMemberShip(externalId);
          databaseBuilder.factory.buildOrganization({ externalId });
          const session = databaseBuilder.factory.buildSession();
          await databaseBuilder.commit();

          const notExistingCertificationCenter = { id: '10203' };
          const request = _buildSchoolinRegistrationsWithConnectedUserRequest(user, notExistingCertificationCenter, session);

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(403);
          expect(response.result.errors[0].title).to.equal('Forbidden');
          expect(response.result.errors[0].detail).to.equal(`User ${user.id} is not a member of certification center ${notExistingCertificationCenter.id}`);
        });
      });

      context('when user is not a member of the certification center', () => {
        let certificationCenterWhereUserDoesNotHaveAccess;

        it('should return Forbidden Access when user are not register in the certificationCenter', async () => {
          // given
          const { user } = _buildUserWithCertificationCenterMemberShip(externalId);
          databaseBuilder.factory.buildOrganization({ externalId });
          certificationCenterWhereUserDoesNotHaveAccess = databaseBuilder.factory.buildCertificationCenter({ externalId });
          const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenterWhereUserDoesNotHaveAccess.id });
          await databaseBuilder.commit();

          const request = _buildSchoolinRegistrationsWithConnectedUserRequest(user, certificationCenterWhereUserDoesNotHaveAccess, session);

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(403);
          expect(response.result.errors[0].title).to.equal('Forbidden');
          expect(response.result.errors[0].detail).to.equal(`User ${user.id} is not a member of certification center ${certificationCenterWhereUserDoesNotHaveAccess.id}`);
        });
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
