import { expect } from 'chai';
import sinon from 'sinon';

import { datamartBuilder } from '../../../../tooling/databases.js';
import { getMaddoServer } from '../../../../tooling/server/shared-server.js';
import { generateValidRequestAuthorizationHeaderForApplication } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Results | Acceptance | Application | parcoursup-route', function () {
  let server, PARCOURSUP_CLIENT_ID, PARCOURSUP_SCOPE, PARCOURSUP_SOURCE;

  beforeEach(async function () {
    server = await getMaddoServer();
    PARCOURSUP_CLIENT_ID = 'test-parcoursupClientId';
    PARCOURSUP_SCOPE = 'parcoursup';
    PARCOURSUP_SOURCE = 'parcoursup';
  });

  describe('/api/application/parcoursup/certification/search', function () {
    let ine, organizationUai, lastName, firstName, birthdate, expectedCertification, certificationResultData;

    beforeEach(async function () {
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
        middleName: 'Middle',
        thirdName: 'Third !',
        birthdate,
        status: 'validated',
        pixScore: 327,
        certificationId: 777,
        certificationCodeVerification: 'CODEVERIF1',
        certificationDate: new Date('2024-11-22T09:39:54Z'),
        certificationIssuedAt: new Date('2024-11-24T12:32:55Z'),
        maxReachableLevel: 7,
        maxReachablePixScore: 895,
      };

      expectedCertification = {
        organizationUai,
        ine,
        lastName,
        firstName,
        middleName: 'Middle',
        thirdName: 'Third !',
        birthdate,
        status: 'validated',
        pixScore: 327,
        certificationId: 777,
        certificationCodeVerification: 'CODEVERIF1',
        certificationDate: new Date('2024-11-22T09:39:54Z'),
        certificationIssuedAt: new Date('2024-11-24T12:32:55Z'),
        maxReachablePixScore: 895,
        globalLevel: 'Indépendant 1',
        maxGlobalLevel: 'Expert 1',
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

      datamartBuilder.factory.buildScoCertificationResult({
        ...certificationResultData,
        competenceCode: '1.1',
        competenceName: 'Mener une recherche et une veille d’information',
        areaName: 'Informations et données',
        competenceLevel: 3,
      });
      datamartBuilder.factory.buildScoCertificationResult({
        ...certificationResultData,
        competenceCode: '1.2',
        competenceName: 'Gérer des données',
        areaName: 'Informations et données',
        competenceLevel: 5,
      });

      await datamartBuilder.commit();
    });

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
      const certificationCodeVerification = 'P-1234567A';
      const lastName = 'NOM-ELEVE';
      const firstName = 'PRENOM-ELEVE';
      const birthdate = '2000-01-01';
      const certificationResultData = {
        lastName,
        firstName,
        birthdate,
        status: 'validated',
        pixScore: 327,
        certificationId: 777,
        certificationCodeVerification,
        certificationDate: new Date('2024-11-22T09:39:54Z'),
        certificationIssuedAt: new Date('2024-11-24T12:32:55Z'),
        maxReachableLevel: 7,
        maxReachablePixScore: 895,
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
          verificationCode: certificationCodeVerification,
        },
      };

      const expectedCertification = {
        ine: undefined,
        organizationUai: undefined,
        lastName,
        firstName,
        middleName: undefined,
        thirdName: undefined,
        birthdate,
        status: 'validated',
        pixScore: 327,
        certificationId: 777,
        certificationCodeVerification,
        certificationDate: new Date('2024-11-22T09:39:54Z'),
        certificationIssuedAt: new Date('2024-11-24T12:32:55Z'),
        maxReachablePixScore: 895,
        globalLevel: 'Indépendant 1',
        maxGlobalLevel: 'Expert 1',
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
  });

  describe('/api/application/parcoursup/info', function () {
    const fakeDate = new Date('2026-12-25');

    beforeEach(async function () {
      sinon.useFakeTimers({ now: fakeDate, toFake: ['Date'] });
      datamartBuilder.factory.buildReplicationMetadata({
        replicationName: 'sco_certification_results',
        lastUpdatedAt: new Date('2026-02-03'),
      });
      datamartBuilder.factory.buildReplicationMetadata({
        replicationName: 'certification_results',
        lastUpdatedAt: new Date('2026-05-06'),
      });
      await datamartBuilder.commit();
    });

    it('should return info', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/application/parcoursup/info`,
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(
            PARCOURSUP_CLIENT_ID,
            PARCOURSUP_SOURCE,
            PARCOURSUP_SCOPE,
          ),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        sentAt: fakeDate,
        lastUpdatedAtCurrentSchoolYear: new Date('2026-02-03'),
        lastUpdatedAtVerificationCode: new Date('2026-05-06'),
      });
    });
  });

  describe('/api/application/parcoursup/certification/latest-certification-by-uai', function () {
    beforeEach(function () {
      const fillerData = {
        nationalStudentId: '1234',
        lastName: 'coucou',
        firstName: 'foo',
        birthdate: '2021-01-01',
        status: 'validated',
        pixScore: 327,
        certificationId: 777,
        certificationCodeVerification: 'CODEVERIF1',
        certificationDate: new Date('2024-11-22T09:39:54Z'),
        maxReachableLevel: 7,
        maxReachablePixScore: 9000,
      };
      datamartBuilder.factory.buildScoCertificationResult({
        ...fillerData,
        organizationUai: 'UAI_A',
        certificationIssuedAt: new Date('2026-12-01'),
      });
      datamartBuilder.factory.buildScoCertificationResult({
        ...fillerData,
        organizationUai: 'UAI_A',
        certificationIssuedAt: new Date('2026-01-01'),
      });
      datamartBuilder.factory.buildScoCertificationResult({
        ...fillerData,
        organizationUai: 'UAI_B',
        certificationIssuedAt: new Date('2025-10-01'),
      });
      datamartBuilder.factory.buildScoCertificationResult({
        ...fillerData,
        organizationUai: 'UAI_B',
        certificationIssuedAt: new Date('2025-11-01'),
      });
      datamartBuilder.factory.buildScoCertificationResult({
        ...fillerData,
        organizationUai: 'UAI_C',
        certificationIssuedAt: new Date('2024-02-01'),
      });
      return datamartBuilder.commit();
    });

    it('returns the Map that associates UAI with latest issued certification date', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/application/parcoursup/certification/latest-certification-by-uai`,
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(
            PARCOURSUP_CLIENT_ID,
            PARCOURSUP_SOURCE,
            PARCOURSUP_SCOPE,
          ),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        UAI_A: new Date('2026-12-01'),
        UAI_B: new Date('2025-11-01'),
        UAI_C: new Date('2024-02-01'),
      });
    });
  });
});
