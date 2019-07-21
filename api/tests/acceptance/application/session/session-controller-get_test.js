const { expect, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-get', () => {

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
      databaseBuilder.factory.buildCertificationCandidate({
        id: 4,
        sessionId: 1,
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

    it('should return sessions information with related certifications and certification candidates', () => {
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
        expect(response.result.data.relationships['certification-candidates']).to.deep.equal({
          'data': [
            {
              'id': '4',
              'type': 'certificationCandidates'
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
        createdAt: new Date('2017-12-08T08:00:00Z'),
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
        createdAt: new Date('2017-12-07T09:00:00Z'),
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
          'id': '1',
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
            },
            'certification-candidates': {
              'data': []
            }
          }
        }, {
          'type': 'sessions',
          'id': '2',
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
            },
            'certification-candidates': {
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

});
