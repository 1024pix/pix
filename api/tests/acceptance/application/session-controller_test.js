const { expect, knex, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | session-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /sessions/{id}', function() {
    let session;

    beforeEach(() => {
      session = databaseBuilder.factory.buildSession({
        id: 1,
        certificationCenter: 'Université de dressage de loutres',
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'ahah',
        accessCode: 'ABCD12'
      });
      databaseBuilder.factory.buildCertificationCourse({
        id: 3,
        sessionId: 1
      });
      databaseBuilder.factory.buildUser.withPixRolePixMaster();

      return databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/sessions/1',
        payload: {},
      });

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return 404 HTTP status code when session does not exist', () => {
      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/sessions/2',
        payload: {},
      });

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
      });
    });

    it('should return sessions information with related certification', () => {
      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/sessions/1',
        payload: {},
      });

      // then
      return promise.then((response) => {
        expect(response.result.data.attributes['access-code']).to.deep.equal(session.accessCode);
        expect(response.result.data.relationships.certifications).to.deep.equal({
          'data': [
            {
              'id': '3',
              'type': 'certifications'
            }
          ]
        });
      });
    });
  });

  describe('GET /sessions', function() {
    let request;

    beforeEach(() => {
      databaseBuilder.factory.buildSession({
        id: 1,
        certificationCenter: 'Centre 1',
        address: 'Paris',
        room: 'Salle 1',
        examiner: 'Bernard',
        date: '2017-12-08',
        time: '14:30',
        accessCode: 'ABC123',
        description: '',
        createdAt: '2017-12-08',
      });

      databaseBuilder.factory.buildSession({
        id: 2,
        certificationCenter: 'Centre 2',
        address: 'Lyon',
        room: 'Salle 2',
        examiner: 'Bernard',
        date: '2017-12-08',
        time: '14:30',
        accessCode: 'DEF456',
        description: '',
        createdAt: '2017-12-07',
      });

      const pixMaster = databaseBuilder.factory.buildUser.withPixRolePixMaster();

      request = {
        method: 'GET',
        url: '/api/sessions',
        headers: { authorization: generateValidRequestAuhorizationHeader(pixMaster.id) },
        payload: {},
      };

      return databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(request);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return all sessions', () => {
      // given
      const expectedResult = {
        data: [{
          'type': 'sessions',
          'id': 1,
          'attributes': {
            'access-code': 'ABC123',
            'address': 'Paris',
            'certification-center': 'Centre 1',
            'date': '2017-12-08',
            'description': '',
            'examiner': 'Bernard',
            'room': 'Salle 1',
            'time': '14:30'
          },
          'relationships': {
            'certifications': {
              'data': []
            }
          }
        }, {
          'type': 'sessions',
          'id': 2,
          'attributes': {
            'access-code': 'DEF456',
            'address': 'Lyon',
            'certification-center': 'Centre 2',
            'date': '2017-12-08',
            'description': '',
            'examiner': 'Bernard',
            'room': 'Salle 2',
            'time': '14:30'
          },
          'relationships': {
            'certifications': {
              'data': []
            }
          }
        }]
      };

      // when
      const promise = server.inject(request);

      // then
      return promise.then((response) => {
        expect(response.result).to.deep.equal(expectedResult);
      });
    });
  });

  describe('POST /sessions', () => {
    let options;

    beforeEach(() => {
      const pixMaster = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      databaseBuilder.factory.buildCertificationCenter({ id: 42, name: 'Tour Gamma' });
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: pixMaster.id, certificationCenterId: 42 });
      options = {
        method: 'POST',
        url: '/api/sessions',
        payload: {
          data: {
            type: 'sessions',
            attributes: {
              'certification-center': 'Université de dressage de loutres',
              'certification-center-id': 42,
              address: 'Nice',
              room: '28D',
              examiner: 'Michel Essentiel',
              date: '08/12/2017',
              time: '14:30',
              description: ''
            }
          }
        },
        headers: { authorization: generateValidRequestAuhorizationHeader(pixMaster.id) },
      };
      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
      return knex('sessions').delete();
    });

    it('should return an OK status after saving in database', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => {
          expect(response.statusCode).to.equal(200);
        })
        .then(() => knex('sessions').select())
        .then((sessions) => {
          expect(sessions).to.have.lengthOf(1);
        });
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

    });

  });

  describe('PATCH /api/sessions/{id}', () => {

    let user, unauthorizedUser, certificationCenter, session, payload;

    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser();
      unauthorizedUser = databaseBuilder.factory.buildUser();
      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: user.id,
        certificationCenterId: certificationCenter.id
      });
      session = databaseBuilder.factory.buildSession({
        certificationCenter: certificationCenter.name,
        certificationCenterId: certificationCenter.id,
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'ahah',
        accessCode: 'ABCD12'
      });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id
      });
      payload = {
        data: {
          id: session.id,
          type: 'sessions',
          attributes: {
            address: 'New address',
            room: 'New room',
            examiner: 'Antoine Toutvenant',
            date: '08/12/2017',
            time: '14:30',
            description: 'ahah',
            accessCode: 'ABCD12'
          }
        }
      };

      await databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should respond with a 200 and update the session', function() {
      const options = {
        method: 'PATCH',
        url: `/api/sessions/${session.id}`,
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        payload
      };

      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result.data.type).to.equal('sessions');
          expect(response.result.data.id).to.equal(session.id);
          expect(response.result.data.attributes.address).to.equal('New address');
          expect(response.result.data.attributes.room).to.equal('New room');
        });
    });

    it('should return 404 HTTP status code when session cannot be found', () => {
      // when
      const promise = server.inject({
        method: 'PATCH',
        url: '/api/sessions/2',
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        payload
      });

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
      });
    });

    it('should respond with a 403 when user is not authorized to update the session', function() {
      const options = {
        method: 'PATCH',
        url: `/api/sessions/${session.id}`,
        headers: { authorization: generateValidRequestAuhorizationHeader(unauthorizedUser.id) },
        payload
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(403);
      });
    });

  });
});
