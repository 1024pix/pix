const {
  expect, generateValidRequestAuthorizationHeader,
  insertUserWithRolePixMaster, insertUserWithStandardRole, knex, nock,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Acceptance | API | Certifications', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/certifications', () => {

    let options;
    let certificationId;
    const authenticatedUserID = 1234;

    const session = {
      certificationCenter: 'Université du Pix',
      address: '1 rue de l\'educ',
      room: 'Salle Benjamin Marteau',
      examiner: '',
      date: '2018-08-14',
      time: '11:00',
      description: '',
      accessCode: 'PIX123',
    };

    const certificationCourse = {
      userId: authenticatedUserID,
      completedAt: new Date('2018-02-15T15:15:52Z'),
      isPublished: true,
      firstName: 'Bro',
      lastName: 'Ther',
      birthdate: '1993-12-08',
      birthplace: 'Asnières IZI',
    };

    const assessment = {
      userId: authenticatedUserID,
      type: Assessment.types.CERTIFICATION,
      state: 'completed',
    };

    const assessmentResult = {
      level: 1,
      pixScore: 23,
      emitter: 'PIX-ALGO',
      status: 'rejected',
    };

    beforeEach(() => {
      return insertUserWithRolePixMaster()
        .then(() => knex('sessions').insert(session).returning('id'))
        .then(([id]) => certificationCourse.sessionId = id)
        .then(() => knex('certification-courses').insert(certificationCourse).returning('id'))
        .then(([id]) => {
          certificationId = id;
          assessment.courseId = id;
        })
        .then(() => knex('assessments').insert(assessment).returning('id'))
        .then(([id]) => assessmentResult.assessmentId = id)
        .then(() => knex('assessment-results').insert(assessmentResult));
    });

    afterEach(async () => {
      await knex('assessment-results').delete();
      await knex('assessments').delete();
      await knex('certification-courses').delete();
      return knex('sessions').delete();
    });

    it('should return 200 HTTP status code', () => {
      options = {
        method: 'GET',
        url: '/api/certifications',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([
          {
            type: 'certifications',
            id: certificationId.toString(),
            attributes: {
              'birthdate': '1993-12-08',
              'birthplace': 'Asnières IZI',
              'certification-center': 'Université du Pix',
              'comment-for-candidate': null,
              'date': new Date('2018-02-15T15:15:52Z'),
              'first-name': 'Bro',
              'is-published': true,
              'last-name': 'Ther',
              'pix-score': 23,
              'status': 'rejected',
            },
            relationships: {
              'result-competence-tree': {
                'data': null,
              },
            },
          },
        ]);
      });
    });

    it('should return 401 HTTP status code if user is not authenticated', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/certifications',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('GET /api/certifications/:id', () => {

    let options;

    const JOHN_USERID = 1234;
    const JOHN_CERTIFICATION_ID = 2;

    const session = {
      id: 1,
      certificationCenter: 'Université du Pix',
      address: '137 avenue de Bercy',
      room: 'La grande',
      examiner: 'Serge le Mala',
      date: '1989-10-24',
      time: '21:30',
      accessCode: 'ABCD12',
    };
    const john_certificationCourse = {
      id: JOHN_CERTIFICATION_ID,
      userId: JOHN_USERID,
      firstName: 'John',
      lastName: 'Doe',
      birthplace: 'Earth',
      birthdate: '1989-10-24',
      completedAt: new Date('2003-02-01T01:02:03Z'),
      sessionId: session.id,
      isPublished: false,
    };
    const john_completedAssessment = {
      id: 1000,
      courseId: JOHN_CERTIFICATION_ID,
      userId: JOHN_USERID,
      type: Assessment.types.CERTIFICATION,
      state: 'completed',
    };
    const assessmentResult = {
      id: 45,
      level: 1,
      pixScore: 23,
      emitter: 'PIX-ALGO',
      status: 'rejected',
      assessmentId: john_completedAssessment.id,
    };
    const competenceMark = {
      level: 3,
      score: 23,
      'area_code': '1',
      'competence_code': '1.1',
      assessmentResultId: assessmentResult.id,
    };

    before(() => {
      nock.cleanAll();

      nock('https://api.airtable.com')
        .get('/v0/test-base/Competences')
        .query(true)
        .times(2)
        .reply(200, {
          records: [
            {
              'id': 'recsvLz0W2ShyfD63',
              'fields': {
                'id': 'recsvLz0W2ShyfD63',
                'Domaine': [
                  'recvoGdo7z2z7pXWa',
                ],
                'Epreuves': [
                  'rec02tVrimXNkgaLD',
                  'rec0gm0GFue3PQB3k',
                  'rec0hoSlSwCeNNLkq',
                  'rec2FcZ4jsPuY1QYt',
                  'rec39bDMnaVw3MyMR',
                  'rec3FMoD8h9USTktb',
                  'rec3P7fvPSpFkIFLV',
                ],
                'Sous-domaine': '1.1',
                'Titre': 'Mener une recherche et une veille d’information',
                'Tests': [
                  'recNPB7dTNt5krlMA',
                ],
                'Acquis (identifiants)': [
                  'recV11ibSCXvaUzZd',
                  'recD01ptfJy7c4Sex',
                  'recfO8994EvSQV9Ip',
                  'recDMMeHSZRCjqo5x',
                  'reci0phtJi0lvqW9j',
                  'recUQSpjuDvwqKMst',
                  'recxqogrKZ9p8b1u8',
                  'recRV35kIeqUQj8cI',
                  'rec50NXHkatsRkjVQ',
                ],
                'Référence': '1.1 Mener une recherche et une veille d’information',
                'Tests Record ID': [
                  'recNPB7dTNt5krlMA',
                ],
                'Acquis': [
                  '@url2',
                  '@url5',
                  '@utiliserserv6',
                  '@rechinfo1',
                  '@eval2',
                  '@publi4',
                  '@modèleEco2',
                  '@utiliserserv1',
                ],
                'Record ID': 'recsvLz0W2ShyfD63',
                'Domaine Titre': [
                  'Information et données',
                ],
                'Domaine Code': [
                  '1',
                ],
              },
              'createdTime': '2017-06-13T13:53:17.000Z',
            },
            {
              'id': 'recNv8qhaY887jQb2',
              'fields': {
                'id': 'recNv8qhaY887jQb2',
                'Domaine': [
                  'recvoGdo7z2z7pXWa',
                ],
                'Epreuves': [
                  'rec02tVrimXNkgaLD',
                  'rec0gm0GFue3PQB3k',
                  'rec0hoSlSwCeNNLkq',
                  'rec2FcZ4jsPuY1QYt',
                  'rec39bDMnaVw3MyMR',
                  'rec3FMoD8h9USTktb',
                  'rec3P7fvPSpFkIFLV',
                ],
                'Sous-domaine': '1.2',
                'Titre': 'Gérer des données',
                'Tests': [
                  'recNPB7dTNt5krlMA',
                ],
                'Acquis (identifiants)': [
                  'recV11ibSCXvaUzZd',
                  'recD01ptfJy7c4Sex',
                  'recfO8994EvSQV9Ip',
                  'recDMMeHSZRCjqo5x',
                  'reci0phtJi0lvqW9j',
                  'recUQSpjuDvwqKMst',
                  'recxqogrKZ9p8b1u8',
                  'recRV35kIeqUQj8cI',
                  'rec50NXHkatsRkjVQ',
                ],
                'Référence': '1.2 Gérer des données',
                'Tests Record ID': [
                  'recNPB7dTNt5krlMA',
                ],
                'Acquis': [
                  '@url2',
                  '@url5',
                  '@utiliserserv6',
                  '@rechinfo1',
                  '@eval2',
                  '@publi4',
                  '@modèleEco2',
                  '@utiliserserv1',
                ],
                'Record ID': 'recNv8qhaY887jQb2',
                'Domaine Titre': [
                  'Information et données',
                ],
                'Domaine Code': [
                  '1',
                ],
              },
              'createdTime': '2017-06-13T13:53:17.000Z',
            },
            {
              'id': 'recIkYm646lrGvLNT',
              'fields': {
                'id': 'recIkYm646lrGvLNT',
                'Domaine': [
                  'recvoGdo7z2z7pXWa',
                ],
                'Epreuves': [
                  'rec02tVrimXNkgaLD',
                  'rec0gm0GFue3PQB3k',
                  'rec0hoSlSwCeNNLkq',
                  'rec2FcZ4jsPuY1QYt',
                  'rec39bDMnaVw3MyMR',
                  'rec3FMoD8h9USTktb',
                  'rec3P7fvPSpFkIFLV',
                ],
                'Sous-domaine': '1.3',
                'Titre': 'Traiter des données',
                'Tests': [
                  'recNPB7dTNt5krlMA',
                ],
                'Acquis (identifiants)': [
                  'recV11ibSCXvaUzZd',
                  'recD01ptfJy7c4Sex',
                  'recfO8994EvSQV9Ip',
                  'recDMMeHSZRCjqo5x',
                  'reci0phtJi0lvqW9j',
                  'recUQSpjuDvwqKMst',
                  'recxqogrKZ9p8b1u8',
                  'recRV35kIeqUQj8cI',
                  'rec50NXHkatsRkjVQ',
                ],
                'Référence': '1.3 Traiter des données',
                'Tests Record ID': [
                  'recNPB7dTNt5krlMA',
                ],
                'Acquis': [
                  '@url2',
                  '@url5',
                  '@utiliserserv6',
                  '@rechinfo1',
                  '@eval2',
                  '@publi4',
                  '@modèleEco2',
                  '@utiliserserv1',
                ],
                'Record ID': 'recIkYm646lrGvLNT',
                'Domaine Titre': [
                  'Information et données',
                ],
                'Domaine Code': [
                  '1',
                ],
              },
              'createdTime': '2017-06-13T13:53:17.000Z',
            }] });

      nock('https://api.airtable.com')
        .get('/v0/test-base/Domaines')
        .query(true)
        .times(2)
        .reply(200, {
          'records': [
            {
              'id': 'recvoGdo7z2z7pXWa',
              'fields': {
                'id': 'recvoGdo7z2z7pXWa',
                'Competences (identifiants)': [
                  'recsvLz0W2ShyfD63',
                  'recNv8qhaY887jQb2',
                  'recIkYm646lrGvLNT',
                ],
                'Code': '1',
                'Titre': 'Information et données',
                'Nom': '1. Information et données',
                'Competences (nom complet)': [
                  '1.1 Mener une recherche et une veille d’information',
                  '1.3 Traiter des données',
                  '1.2 Gérer des données',
                ],
              },
              'createdTime': '2017-06-13T13:15:26.000Z',
            },
          ],
        });
    });

    after(() => {
      nock.cleanAll();
    });

    beforeEach(() => {
      return knex('sessions').insert(session)
        .then(insertUserWithRolePixMaster)
        .then(insertUserWithStandardRole)
        .then(() => knex('certification-courses').insert(john_certificationCourse))
        .then(() => knex('assessments').insert(john_completedAssessment))
        .then(() => knex('assessment-results').insert(assessmentResult))
        .then(() => knex('competence-marks').insert(competenceMark));
    });

    afterEach(async () => {
      await knex('competence-marks').delete();
      await knex('assessment-results').delete();
      await knex('assessments').delete();
      await knex('certification-courses').delete();
      return knex('sessions').delete();
    });

    it('should return 200 HTTP status code and the certification with the result competence tree included', () => {
      // given
      options = {
        method: 'GET',
        url: `/api/certifications/${JOHN_CERTIFICATION_ID}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(JOHN_USERID) },
      };

      // when
      const promise = server.inject(options);

      // then
      const expectedBody = {
        'data': {
          'attributes': {
            'birthdate': '1989-10-24',
            'birthplace': 'Earth',
            'certification-center': 'Université du Pix',
            'comment-for-candidate': null,
            'date': new Date('2003-02-01T01:02:03Z'),
            'first-name': 'John',
            'is-published': false,
            'last-name': 'Doe',
            'pix-score': 23,
            'status': 'rejected',
          },
          'id': '2',
          'relationships': {
            'result-competence-tree': {
              'data': {
                'id': '2-45',
                'type': 'result-competence-trees',
              },
            },
          },
          'type': 'certifications',
        },
        'included': [
          {
            'attributes': {
              'index': '1.1',
              'level': 3,
              'name': 'Mener une recherche et une veille d’information',
              'score': 23,
            },
            'id': 'recsvLz0W2ShyfD63',
            'type': 'result-competences',
          },
          {
            'attributes': {
              'index': '1.2',
              'level': -1,
              'name': 'Gérer des données',
              'score': 0,
            },
            'id': 'recNv8qhaY887jQb2',
            'type': 'result-competences',
          },
          {
            'attributes': {
              'index': '1.3',
              'level': -1,
              'name': 'Traiter des données',
              'score': 0,
            },
            'id': 'recIkYm646lrGvLNT',
            'type': 'result-competences',
          },
          {
            'attributes': {
              'code': '1',
              'name': '1. Information et données',
              'title': 'Information et données',
            },
            'id': 'recvoGdo7z2z7pXWa',
            'relationships': {
              'result-competences': {
                'data': [
                  {
                    'id': 'recsvLz0W2ShyfD63',
                    'type': 'result-competences',
                  },
                  {
                    'id': 'recNv8qhaY887jQb2',
                    'type': 'result-competences',
                  },
                  {
                    'id': 'recIkYm646lrGvLNT',
                    'type': 'result-competences',
                  },
                ],
              },
            },
            'type': 'areas',
          },
          {
            'attributes': {
              'id': '2-45',
            },
            'id': '2-45',
            'relationships': {
              'areas': {
                'data': [
                  {
                    'id': 'recvoGdo7z2z7pXWa',
                    'type': 'areas',
                  },
                ],
              },
            },
            'type': 'result-competence-trees',
          },
        ],
      };
      return promise
        .then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal(expectedBody);
        });
    });

    it('should return unauthorized 403 HTTP status code when user is not owner of the certification', () => {
      // given
      const NOT_JOHN_USERID = JOHN_USERID + 1;
      options = {
        method: 'GET',
        url: `/api/certifications/${JOHN_CERTIFICATION_ID}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(NOT_JOHN_USERID) },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => expect(response.statusCode).to.equal(403));
    });
  });

  describe('PATCH /api/certifications/:id', () => {

    let options;

    const JOHN_USERID = 1234;
    const JOHN_CERTIFICATION_ID = 2;

    const john_certificationCourse = {
      id: JOHN_CERTIFICATION_ID,
      userId: JOHN_USERID,
      firstName: 'John',
      lastName: 'Doe',
      birthplace: 'Earth',
      birthdate: '1991-10-24',
      completedAt: new Date('2003-01-02T01:02:03Z'),
      sessionId: 1,
      isPublished: false,
    };
    const john_completedAssessment = {
      id: 1,
      courseId: JOHN_CERTIFICATION_ID,
      userId: JOHN_USERID,
      type: Assessment.types.CERTIFICATION,
      state: 'completed',
    };
    const assessmentResult = {
      assessmentId: 1,
      level: 1,
      pixScore: 23,
      emitter: 'PIX-ALGO',
      status: 'rejected',
    };
    const session = {
      id: 1,
      certificationCenter: 'Université du Pix',
      address: '137 avenue de Bercy',
      room: 'La grande',
      examiner: 'Serge le Mala',
      date: '1989-10-24',
      time: '21:30',
      accessCode: 'ABCD12',
    };

    beforeEach(() => {
      return knex('sessions').insert(session).returning('id')
        .then(insertUserWithRolePixMaster)
        .then(insertUserWithStandardRole)
        .then(() => knex('certification-courses').insert(john_certificationCourse))
        .then(() => knex('assessments').insert(john_completedAssessment))
        .then(() => knex('assessment-results').insert(assessmentResult));
    });

    afterEach(async () => {
      await knex('assessment-results').delete();
      await knex('assessments').delete();
      await knex('certification-courses').delete();
      return knex('sessions').delete();
    });

    it('should return 200 HTTP status code and the updated certification', () => {
      // given
      options = {
        method: 'PATCH',
        url: `/api/certifications/${JOHN_CERTIFICATION_ID}`,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
        payload: {
          data: {
            type: 'certifications',
            id: JOHN_CERTIFICATION_ID,
            attributes: {
              'is-published': true,
            },
          },
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.deep.equal({
            type: 'certifications',
            id: JOHN_CERTIFICATION_ID.toString(),
            attributes: {
              'birthdate': '1991-10-24',
              'birthplace': 'Earth',
              'certification-center': 'Université du Pix',
              'comment-for-candidate': null,
              'date': new Date('2003-01-02T01:02:03Z'),
              'first-name': 'John',
              'is-published': true,
              'last-name': 'Doe',
              'pix-score': 23,
              'status': 'rejected',
            },
            relationships: {
              'result-competence-tree': {
                'data': null,
              },
            },
          });
        })
        .then(() => knex('certification-courses').where('id', JOHN_CERTIFICATION_ID))
        .then((foundCertification) => expect(foundCertification[0].isPublished == true).to.be.true);
    });

    it('should return unauthorized 403 HTTP status code when user is not pixMaster', () => {
      // given
      options = {
        method: 'PATCH',
        url: `/api/certifications/${JOHN_CERTIFICATION_ID}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(4444) },
        payload: {
          data: {
            attributes: {
              'is-published': true,
            },
          },
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => expect(response.statusCode).to.equal(403))
        .then(() => knex('certification-courses').where('id', JOHN_CERTIFICATION_ID))
        .then((certifications) => expect(certifications[0].isPublished == true).to.be.false);
    });
  });

});
