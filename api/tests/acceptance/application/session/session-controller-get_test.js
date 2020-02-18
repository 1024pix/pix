const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-get', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /sessions/{id}', function() {
    let userId;
    let request;

    beforeEach(() => {
      databaseBuilder.factory.buildSession({
        id: 1,
        certificationCenter: 'Université de dressage de loutres',
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'ahah',
        status: 'created',
        accessCode: 'ABCD12',
        examinerGlobalComment: 'It was a fine session my dear',
      });
      userId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      request = {
        method: 'GET',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {},
      };

      return databaseBuilder.commit();
    });

    it('should return 200 HTTP status code', async () => {
      // given
      request.url = '/api/sessions/1';

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 404 HTTP status code when session does not exist', async () => {
      // given
      request.url = '/api/sessions/2';

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('GET /sessions', function() {
    let request;

    beforeEach(() => {
      const certifCenter1Id = databaseBuilder.factory.buildCertificationCenter({ name: 'Centre 1' }).id;
      const certifCenter2Id = databaseBuilder.factory.buildCertificationCenter({ name: 'Centre 2' }).id;
      databaseBuilder.factory.buildSession({
        id: 1,
        certificationCenter: 'Centre 1',
        certificationCenterId: certifCenter1Id,
        address: 'Paris',
        room: 'Salle 1',
        examiner: 'Bernard',
        date: '2017-12-08',
        time: '14:30',
        accessCode: 'ABC123',
        description: '',
        status: 'started',
        examinerGlobalComment: 'It was a fine session my dear',
        createdAt: new Date('2017-12-08T08:00:00Z'),
      });

      databaseBuilder.factory.buildSession({
        id: 2,
        certificationCenter: 'Centre 2',
        certificationCenterId: certifCenter2Id,
        address: 'Lyon',
        room: 'Salle 2',
        examiner: 'Bernard',
        date: '2017-12-08',
        time: '14:30',
        accessCode: 'DEF456',
        description: '',
        status: 'started',
        examinerGlobalComment: 'It was a fine session my dear',
        createdAt: new Date('2017-12-07T09:00:00Z'),
      });

      const pixMaster = databaseBuilder.factory.buildUser.withPixRolePixMaster();

      request = {
        method: 'GET',
        url: '/api/sessions',
        headers: { authorization: generateValidRequestAuthorizationHeader(pixMaster.id) },
        payload: {},
      };

      return databaseBuilder.commit();
    });

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
            'time': '14:30:00',
            'status': 'started',
            'examiner-global-comment': 'It was a fine session my dear',
            'finalized-at': null,
          },
          'relationships': {
            'certifications': {
              'links': {
                'related': '/api/sessions/1/certifications',
              }
            },
            'certification-candidates': {
              'links': {
                'related': '/api/sessions/1/certification-candidates',
              }
            },
            'certification-reports': {
              'links': {
                'related': '/api/sessions/1/certification-reports',
              }
            },
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
            'time': '14:30:00',
            'status': 'started',
            'examiner-global-comment': 'It was a fine session my dear',
            'finalized-at': null,
          },
          'relationships': {
            'certifications': {
              'links': {
                'related': '/api/sessions/2/certifications',
              }
            },
            'certification-candidates': {
              'links': {
                'related': '/api/sessions/2/certification-candidates',
              }
            },
            'certification-reports': {
              'links': {
                'related': '/api/sessions/2/certification-reports',
              }
            },
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
