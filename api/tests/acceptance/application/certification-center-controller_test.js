const _ = require('lodash');
const {
  expect, generateValidRequestAuthorizationHeader, cleanupUsersAndPixRolesTables,
  insertUserWithRolePixMaster, databaseBuilder
} = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | Certification Center', () => {

  let server, options;

  beforeEach(async () => {
    await cleanupUsersAndPixRolesTables();
    server = await createServer();
    await insertUserWithRolePixMaster();
  });
  afterEach(() => {
    return cleanupUsersAndPixRolesTables();
  });

  describe('GET /api/certification-centers', () => {
    beforeEach(async () => {
      options = {
        method: 'GET',
        url: '/api/certification-centers',
      };

      _.times(5, databaseBuilder.factory.buildCertificationCenter);
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return 200 HTTP status', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should return a list of certificationCenter, with their name and id', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result.data).to.have.lengthOf(5);
          expect(_.keys(response.result.data[0].attributes)).to.have.members(['id', 'name', 'created-at']);
        });
      });
    });
    context('when user is not PixMaster', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });

  describe('POST /api/certification-centers', () => {
    beforeEach(() => {
      options = {
        method: 'POST',
        url: '/api/certification-centers',
        payload: {
          data: {
            type: 'certification-center',
            attributes: {
              name: 'Nouveau Centre de Certif'
            }
          }
        }
      };
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return 200 HTTP status', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should return the certification center created', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result.data.attributes.name).to.equal('Nouveau Centre de Certif');
          expect(response.result.data.attributes.id).to.be.ok;
        });
      });

    });

    context('when user is not PixMaster', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

  });

  describe('GET /api/certification-centers/{id}', () => {
    const expectedCertificationCenterId = 1;
    let expectedCertificationCenter;
    beforeEach(async() => {
      options = {
        method: 'GET',
        url: '/api/certification-centers/' + expectedCertificationCenterId,
      };
      expectedCertificationCenter = databaseBuilder.factory.buildCertificationCenter({ id: expectedCertificationCenterId });
      databaseBuilder.factory.buildCertificationCenter({ id: expectedCertificationCenterId + 1 });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return 200 HTTP status', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should return the certification center asked', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result.data.id).to.equal('1');
          expect(response.result.data.attributes.name).to.equal(expectedCertificationCenter.name);
        });
      });

      it('should return notFoundError when the certificationCenter not exist', () => {
        // given
        options.url = '/api/certification-centers/112334';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].title).to.equal('Not Found');
          expect(response.result.errors[0].detail).to.equal('Certification center with id: 112334 not found');
        });
      });

    });

    context('when user is not PixMaster', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });

  describe('GET /api/certification-centers/{id}/sessions', () => {
    const certificationCenterId = 1;
    let expectedSessions;
    let user, otherUser;

    beforeEach(async() => {
      options = {
        method: 'GET',
        url: '/api/certification-centers/' + certificationCenterId + '/sessions',
      };
      databaseBuilder.factory.buildCertificationCenter({ id: certificationCenterId });
      user = databaseBuilder.factory.buildUser();
      otherUser = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCenterMembership({ certificationCenterId: certificationCenterId, userId: user.id });
      expectedSessions = [
        databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenterId }),
        databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenterId })
      ];
      databaseBuilder.factory.buildSession({ certificationCenterId: null });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('when user is linked to the certification center', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(user.id) };
      });

      it('should return 200 HTTP status', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should return the list of sessions', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result.data).to.have.lengthOf(expectedSessions.length);
          expect(response.result.data.map((sessions) => sessions.id))
            .to.have.members(expectedSessions.map((sessions) => sessions.id.toString()));
        });
      });

    });

    context('when user is not linked to certification center', () => {
      beforeEach(async () => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(otherUser.id) };
      });

      it('should return 403 HTTP status code ', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });

});
