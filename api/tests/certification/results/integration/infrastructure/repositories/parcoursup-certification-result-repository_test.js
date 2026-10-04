import { expect } from 'chai';

import * as parcoursupCertificationResultRepository from '../../../../../../src/certification/results/infrastructure/repositories/parcoursup-certification-result-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { datamartBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Results | Integration | Infrastructure | Repositories | parcoursup-certification-result-repository', function () {
  describe('#getByINE', function () {
    context('when a certification is found', function () {
      it('should return the certification', async function () {
        // given
        const ine = '1234';
        const certificationResultData = {
          nationalStudentId: ine,
          organizationUai: 'UAI ETAB ELEVE',
          lastName: 'NOM-ELEVE',
          firstName: 'PRENOM-ELEVE',
          birthdate: '2000-01-01',
          status: 'validated',
          pixScore: 327,
          certificationId: 777,
          certificationCodeVerification: 'CODEVERIF1',
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          certificationIssuedAt: new Date('2024-11-24T12:01:22Z'),
          maxReachableLevel: 7,
          maxReachablePixScore: 9000,
        };
        datamartBuilder.factory.buildScoCertificationResult({
          ...certificationResultData,
          competenceCode: '1.1',
          competenceName: "Mener une recherche et une veille d'information",
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

        // when
        const results = await parcoursupCertificationResultRepository.getByINE({ ine });

        // then
        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          ine,
          organizationUai: 'UAI ETAB ELEVE',
          lastName: 'NOM-ELEVE',
          firstName: 'PRENOM-ELEVE',
          birthdate: '2000-01-01',
          status: 'validated',
          pixScore: 327,
          certificationId: 777,
          certificationCodeVerification: 'CODEVERIF1',
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          certificationIssuedAt: new Date('2024-11-24T12:01:22Z'),
          maxReachableLevel: 7,
          maxReachablePixScore: 9000,
          competences: [
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.1',
              name: "Mener une recherche et une veille d'information",
              areaName: 'Informations et données',
              level: 3,
            }),
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.2',
              name: 'Gérer des données',
              areaName: 'Informations et données',
              level: 5,
            }),
          ],
        });
        expect(results).to.deep.equal([expectedCertification]);
      });
    });

    context('when no certifications are found for given ine', function () {
      it('should throw Not Found Error', async function () {
        // given
        const ine = '1234';

        // when
        const err = await catchErr(parcoursupCertificationResultRepository.getByINE)({ ine });

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.deep.equal('No certifications found for given search parameters');
      });
    });
  });

  describe('#getByOrganizationUAI', function () {
    describe('when a certification is found', function () {
      it('should return the certification', async function () {
        // given
        const organizationUai = '1234567A';
        const lastName = 'LEPONGE';
        const firstName = 'Bob';
        const birthdate = '2000-01-01';
        const certificationResultData = {
          nationalStudentId: '1234',
          organizationUai,
          lastName,
          firstName,
          birthdate,
          status: 'validated',
          pixScore: 327,
          certificationId: 777,
          certificationCodeVerification: 'CODEVERIF1',
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          certificationIssuedAt: new Date('2024-11-24T12:01:22Z'),
          maxReachableLevel: 7,
          maxReachablePixScore: 9000,
        };
        datamartBuilder.factory.buildScoCertificationResult({
          ...certificationResultData,
          competenceCode: '1.2',
          competenceName: 'Gérer des données',
          areaName: 'Informations et données',
          competenceLevel: 5,
        });
        datamartBuilder.factory.buildScoCertificationResult({
          ...certificationResultData,
          competenceCode: '1.1',
          competenceName: "Mener une recherche et une veille d'information",
          areaName: 'Informations et données',
          competenceLevel: 3,
        });
        await datamartBuilder.commit();

        // when
        const results = await parcoursupCertificationResultRepository.getByOrganizationUAI({
          organizationUai,
          lastName,
          firstName,
          birthdate,
        });

        // then
        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          ine: '1234',
          organizationUai,
          lastName,
          firstName,
          birthdate,
          status: 'validated',
          pixScore: 327,
          certificationId: 777,
          certificationCodeVerification: 'CODEVERIF1',
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          certificationIssuedAt: new Date('2024-11-24T12:01:22Z'),
          maxReachableLevel: 7,
          maxReachablePixScore: 9000,
          competences: [
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.2',
              name: 'Gérer des données',
              areaName: 'Informations et données',
              level: 5,
            }),
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.1',
              name: "Mener une recherche et une veille d'information",
              areaName: 'Informations et données',
              level: 3,
            }),
          ],
        });
        expect(results).to.deep.equal([expectedCertification]);
      });
    });

    describe('when no certifications are found for given organizationUai', function () {
      it('should throw Not Found Error', async function () {
        // given
        const organizationUai = '1234567B';
        const lastName = 'LEPONGE';
        const firstName = 'Bob';
        const birthdate = '2000-01-01';

        // when
        const err = await catchErr(parcoursupCertificationResultRepository.getByOrganizationUAI)({
          organizationUai,
          lastName,
          firstName,
          birthdate,
        });

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.deep.equal('No certifications found for given search parameters');
      });
    });
  });

  describe('#getByVerificationCode', function () {
    describe('when a certification is found', function () {
      it('should return the certification', async function () {
        // given
        const certificationCodeVerification = 'P-1234567A';
        const lastName = 'LEPONGE';
        const firstName = 'Bob';
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
          certificationIssuedAt: new Date('2024-11-24T12:01:22Z'),
          maxReachableLevel: 7,
          maxReachablePixScore: 9000,
        };
        datamartBuilder.factory.buildCertificationResult({
          ...certificationResultData,
          competenceCode: '1.1',
          competenceName: "Mener une recherche et une veille d'information",
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

        // when
        const results = await parcoursupCertificationResultRepository.getByVerificationCode({
          verificationCode: certificationCodeVerification,
        });

        // then
        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          lastName,
          firstName,
          birthdate,
          status: 'validated',
          pixScore: 327,
          certificationId: 777,
          certificationCodeVerification,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          certificationIssuedAt: new Date('2024-11-24T12:01:22Z'),
          maxReachableLevel: 7,
          maxReachablePixScore: 9000,
          competences: [
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.1',
              name: "Mener une recherche et une veille d'information",
              areaName: 'Informations et données',
              level: 3,
            }),
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.2',
              name: 'Gérer des données',
              areaName: 'Informations et données',
              level: 5,
            }),
          ],
        });
        expect(results).to.deep.equal([expectedCertification]);
      });
    });

    describe('when no certifications are found for a given verification code, first name and last name', function () {
      it('should throw Not Found Error', async function () {
        // given
        const verificationCode = 'P-1234567B';

        // when
        const err = await catchErr(parcoursupCertificationResultRepository.getByVerificationCode)({
          verificationCode,
        });

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.deep.equal('No certifications found for given search parameters');
      });
    });
  });
});
