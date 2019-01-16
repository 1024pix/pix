const {
  expect, generateValidRequestAuhorizationHeader, cleanupUsersAndPixRolesTables,
  insertUserWithRolePixMaster
} = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | Certification Center', () => {

  let server, options;

  beforeEach(async () => {
    server = await createServer();
    await insertUserWithRolePixMaster();
  });
  afterEach(() => {
    return cleanupUsersAndPixRolesTables();
  });

  describe('GET /api/certification-centers', () => {
    beforeEach(() => {
      options = {
        method: 'GET',
        url: '/api/certification-centers',
      };
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuhorizationHeader() };
      });

      it('should return 200 HTTP status', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });
    });

    context('when user is not PixMaster', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuhorizationHeader(1111) };
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
      };
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuhorizationHeader() };
      });

      it('should return 200 HTTP status', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });
    });

    context('when user is not PixMaster', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuhorizationHeader(1111) };
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
    beforeEach(() => {
      options = {
        method: 'GET',
        url: '/api/certification-centers/1',
      };
    });

    context('when user is Pix Master', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuhorizationHeader() };
      });

      it('should return 200 HTTP status', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });
    });

    context('when user is not PixMaster', () => {
      beforeEach(() => {
        options.headers = { authorization: generateValidRequestAuhorizationHeader(1111) };
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
