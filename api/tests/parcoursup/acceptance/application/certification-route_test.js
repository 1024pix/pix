import {
  createServer,
  datamartBuilder,
  expect,
  generateValidRequestAuthorizationHeaderForApplication,
} from '../../../test-helper.js';

describe('Parcoursup | Acceptance | Application | certification-route', function () {
  let server,
    ine,
    organizationUai,
    lastName,
    firstName,
    birthdate,
    PARCOURSUP_CLIENT_ID,
    PARCOURSUP_SCOPE,
    PARCOURSUP_SOURCE,
    expectedCertification,
    certificationResultData;

  beforeEach(async function () {
    server = await createServer();

    PARCOURSUP_CLIENT_ID = 'test-parcoursupClientId';
    PARCOURSUP_SCOPE = 'parcoursup';
    PARCOURSUP_SOURCE = 'parcoursup';

    ine = '123456789OK';
    organizationUai = 'UAI ETAB ELEVE';
    lastName = 'NOM-ELEVE';
    firstName = 'PRENOM-ELEVE';
    birthdate = '2000-01-01';

    certificationResultData = {
      nationalStudentId: ine,
      organizationUai,
      lastName,
      firstName,
      birthdate,
      status: 'validated',
      pixScore: 327,
      certificationDate: '2024-11-22T09:39:54Z',
    };

    expectedCertification = {
      organizationUai,
      ine,
      lastName,
      firstName,
      birthdate,
      status: 'validated',
      pixScore: 327,
      certificationDate: new Date('2024-11-22T09:39:54Z'),
      competences: [
        {
          code: '1.1',
          name: 'Mener une recherche et une veille d’information',
          areaName: 'Informations et données',
          level: 3,
        },
        {
          code: '1.2',
          name: 'Gérer des données',
          areaName: 'Informations et données',
          level: 5,
        },
      ],
    };

    datamartBuilder.factory.buildCertificationResult({
      ...certificationResultData,
      competenceCode: '1.1',
      competenceName: 'Mener une recherche et une veille d’information',
      areaName: 'Informations et données',
      competenceLevel: 3,
    });
    datamartBuilder.factory.buildCertificationResult({
      ...certificationResultData,
      competenceCode: '1.2',
      competenceName: 'Gérer des données',
      areaName: 'Informations et données',
      competenceLevel: 5,
    });

    await datamartBuilder.commit();
  });

  describe('POST /api/application/parcoursup/certification/search', function () {
    it('should return 200 HTTP status code and a certification for a given INE', async function () {
      // given
      const options = {
        method: 'POST',
        url: `/api/application/parcoursup/certification/search`,
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(
            PARCOURSUP_CLIENT_ID,
            PARCOURSUP_SOURCE,
            PARCOURSUP_SCOPE,
          ),
        },
        payload: {
          ine,
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedCertification);
    });

    it('should return 200 HTTP status code and a certification for a given UAI, last name, first name and birthdate', async function () {
      // given
      const options = {
        method: 'POST',
        url: `/api/application/parcoursup/certification/search`,
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(
            PARCOURSUP_CLIENT_ID,
            PARCOURSUP_SOURCE,
            PARCOURSUP_SCOPE,
          ),
        },
        payload: {
          organizationUai,
          lastName,
          firstName,
          birthdate,
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedCertification);
    });

    it('should return 200 HTTP status code and a certification for a given vérificationCode', async function () {
      // given
      const verificationCode = 'P-1234567A';
      const lastName = 'NOM-ELEVE';
      const firstName = 'PRENOM-ELEVE';
      const birthdate = '2000-01-01';
      const certificationResultData = {
        verificationCode,
        lastName,
        firstName,
        birthdate,
        status: 'validated',
        pixScore: 327,
        certificationDate: '2024-11-22T09:39:54Z',
      };
      datamartBuilder.factory.buildCertificationResultCodeValidation({
        ...certificationResultData,
        competenceCode: '1.1',
        competenceName: 'Mener une recherche et une veille d’information',
        areaName: 'Informations et données',
        competenceLevel: 3,
      });
      datamartBuilder.factory.buildCertificationResultCodeValidation({
        ...certificationResultData,
        competenceCode: '1.2',
        competenceName: 'Gérer des données',
        areaName: 'Informations et données',
        competenceLevel: 5,
      });
      await datamartBuilder.commit();

      const options = {
        method: 'POST',
        url: '/api/application/parcoursup/certification/search',
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(
            PARCOURSUP_CLIENT_ID,
            PARCOURSUP_SOURCE,
            PARCOURSUP_SCOPE,
          ),
        },
        payload: {
          verificationCode,
        },
      };

      const expectedCertification = {
        ine: undefined,
        organizationUai: undefined,
        lastName,
        firstName,
        birthdate,
        status: 'validated',
        pixScore: 327,
        certificationDate: new Date('2024-11-22T09:39:54Z'),
        competences: [
          {
            code: '1.1',
            name: 'Mener une recherche et une veille d’information',
            areaName: 'Informations et données',
            level: 3,
          },
          {
            code: '1.2',
            name: 'Gérer des données',
            areaName: 'Informations et données',
            level: 5,
          },
        ],
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedCertification);
    });

    it('should return 409 HTTP status code in case of duplicated certification results', async function () {
      // given
      // Same candidate but with another birthdate
      datamartBuilder.factory.buildCertificationResult({
        ...certificationResultData,
        birthdate: '1999-01-01',
      });
      await datamartBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/application/parcoursup/certification/search`,
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(
            PARCOURSUP_CLIENT_ID,
            PARCOURSUP_SOURCE,
            PARCOURSUP_SCOPE,
          ),
        },
        payload: {
          ine,
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(409);
    });
  });
});
