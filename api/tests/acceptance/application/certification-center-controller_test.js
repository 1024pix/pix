const _ = require('lodash');
const {
  expect, generateValidRequestAuthorizationHeader,
  insertUserWithRolePixMaster, databaseBuilder, knex
} = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | Certification Center', () => {

  let server, options;

  beforeEach(async () => {
    server = await createServer();
    await insertUserWithRolePixMaster();
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
          expect(_.keys(response.result.data[0].attributes)).to.have.members(['id', 'name', 'type', 'external-id', 'created-at']);
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

    afterEach(async () => {
      await knex('certification-centers').delete();
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
    let expectedCertificationCenter;
    beforeEach(async() => {
      expectedCertificationCenter = databaseBuilder.factory.buildCertificationCenter({});
      databaseBuilder.factory.buildCertificationCenter({});
      await databaseBuilder.commit();
      options = {
        method: 'GET',
        url: '/api/certification-centers/' + expectedCertificationCenter.id,
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

      it('should return the certification center asked', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result.data.id).to.equal(expectedCertificationCenter.id.toString());
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
        databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id })
      ];
      databaseBuilder.factory.buildSession({});
      await databaseBuilder.commit();
      options = {
        method: 'GET',
        url: '/api/certification-centers/' + certificationCenter.id + '/sessions',
      };
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
