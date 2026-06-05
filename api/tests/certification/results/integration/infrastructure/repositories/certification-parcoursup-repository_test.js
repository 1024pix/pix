import * as certificationRepository from '../../../../../../src/certification/results/infrastructure/repositories/certification-parcoursup-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { datamartBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Results | Infrastructure | Integration | Repositories | certification-parcoursup', function () {
  describe('#getByINE', function () {
    describe('when a certification is found', function () {
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
          certificationDate: new Date('2024-11-22T09:39:54Z'),
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
        const results = await certificationRepository.getByINE({ ine });

        // then
        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          ine,
          organizationUai: 'UAI ETAB ELEVE',
          lastName: 'NOM-ELEVE',
          firstName: 'PRENOM-ELEVE',
          birthdate: '2000-01-01',
          status: 'validated',
          pixScore: 327,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
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
          maxReachableLevel: 7,
        });
        expect(results).to.deep.equal([expectedCertification]);
      });

      it('should fallback to MESH_CONFIGURATION size when scoring_configuration is null', async function () {
        // given
        const ine = '1234';
        datamartBuilder.factory.buildCertificationResult({
          nationalStudentId: ine,
          organizationUai: 'UAI ETAB ELEVE',
          lastName: 'NOM-ELEVE',
          firstName: 'PRENOM-ELEVE',
          birthdate: '2000-01-01',
          status: 'validated',
          pixScore: 327,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          competenceCode: '1.1',
          competenceName: "Mener une recherche et une veille d'information",
          areaName: 'Informations et données',
          competenceLevel: 3,
          configuration: null,
        });
        await datamartBuilder.commit();

        // when
        const results = await certificationRepository.getByINE({ ine });

        // then
        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          ine,
          organizationUai: 'UAI ETAB ELEVE',
          lastName: 'NOM-ELEVE',
          firstName: 'PRENOM-ELEVE',
          birthdate: '2000-01-01',
          status: 'validated',
          pixScore: 327,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          competences: [
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.1',
              name: "Mener une recherche et une veille d'information",
              areaName: 'Informations et données',
              level: 3,
            }),
          ],
          maxReachableLevel: 7,
        });
        expect(results).to.deep.equal([expectedCertification]);
      });

      it('should keep only one competence by competence code', async function () {
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
          certificationDate: new Date('2024-11-22T09:39:54Z'),
        };
        const duplicatedCompetency = {
          competenceCode: '1.1',
          competenceName: "Mener une recherche et une veille d'information",
          areaName: 'Informations et données',
          competenceLevel: 3,
        };
        datamartBuilder.factory.buildCertificationResult({
          ...certificationResultData,
          ...duplicatedCompetency,
        });
        datamartBuilder.factory.buildCertificationResult({
          ...certificationResultData,
          ...duplicatedCompetency,
        });
        await datamartBuilder.commit();

        // when
        const results = await certificationRepository.getByINE({ ine });

        // then
        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          ine,
          organizationUai: 'UAI ETAB ELEVE',
          lastName: 'NOM-ELEVE',
          firstName: 'PRENOM-ELEVE',
          birthdate: '2000-01-01',
          status: 'validated',
          pixScore: 327,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          competences: [
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.1',
              name: "Mener une recherche et une veille d'information",
              areaName: 'Informations et données',
              level: 3,
            }),
          ],
          maxReachableLevel: 7,
        });
        expect(results).to.deep.equal([expectedCertification]);
      });
    });

    describe('when no certifications are found for given ine', function () {
      it('should throw Not Found Error', async function () {
        // given
        const ine = '1234';

        // when
        const err = await catchErr(certificationRepository.getByINE)({ ine });

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
          certificationDate: new Date('2024-11-22T09:39:54Z'),
        };
        datamartBuilder.factory.buildCertificationResult({
          ...certificationResultData,
          competenceCode: '1.2',
          competenceName: 'Gérer des données',
          areaName: 'Informations et données',
          competenceLevel: 5,
        });
        datamartBuilder.factory.buildCertificationResult({
          ...certificationResultData,
          competenceCode: '1.1',
          competenceName: "Mener une recherche et une veille d'information",
          areaName: 'Informations et données',
          competenceLevel: 3,
        });
        await datamartBuilder.commit();

        // when
        const results = await certificationRepository.getByOrganizationUAI({
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
          certificationDate: new Date('2024-11-22T09:39:54Z'),
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
          maxReachableLevel: 7,
        });
        expect(results).to.deep.equal([expectedCertification]);
      });

      it('should fallback to MESH_CONFIGURATION size when scoring_configuration is null', async function () {
        // given
        const organizationUai = '1234567A';
        const lastName = 'LEPONGE';
        const firstName = 'Bob';
        const birthdate = '2000-01-01';
        datamartBuilder.factory.buildCertificationResult({
          nationalStudentId: '1234',
          organizationUai,
          lastName,
          firstName,
          birthdate,
          status: 'validated',
          pixScore: 327,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          competenceCode: '1.1',
          competenceName: "Mener une recherche et une veille d'information",
          areaName: 'Informations et données',
          competenceLevel: 3,
          configuration: null,
        });
        await datamartBuilder.commit();

        // when
        const results = await certificationRepository.getByOrganizationUAI({
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
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          competences: [
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.1',
              name: "Mener une recherche et une veille d'information",
              areaName: 'Informations et données',
              level: 3,
            }),
          ],
          maxReachableLevel: 7,
        });
        expect(results).to.deep.equal([expectedCertification]);
      });

      it('should keep only one competence by competence code', async function () {
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
          certificationDate: new Date('2024-11-22T09:39:54Z'),
        };

        const duplicatedCompetency = {
          competenceCode: '1.2',
          competenceName: 'Gérer des données',
          areaName: 'Informations et données',
          competenceLevel: 5,
        };

        datamartBuilder.factory.buildCertificationResult({
          ...certificationResultData,
          ...duplicatedCompetency,
        });
        datamartBuilder.factory.buildCertificationResult({
          ...certificationResultData,
          ...duplicatedCompetency,
        });
        await datamartBuilder.commit();

        // when
        const results = await certificationRepository.getByOrganizationUAI({
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
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          competences: [
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.2',
              name: 'Gérer des données',
              areaName: 'Informations et données',
              level: 5,
            }),
          ],
          maxReachableLevel: 7,
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
        const err = await catchErr(certificationRepository.getByOrganizationUAI)({
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
        const verificationCode = 'P-1234567A';
        const lastName = 'LEPONGE';
        const firstName = 'Bob';
        const birthdate = '2000-01-01';
        const certificationResultData = {
          verificationCode,
          lastName,
          firstName,
          birthdate,
          status: 'validated',
          pixScore: 327,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
        };
        datamartBuilder.factory.buildCertificationResultCodeValidation({
          ...certificationResultData,
          competenceCode: '1.1',
          competenceName: "Mener une recherche et une veille d'information",
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

        // when
        const results = await certificationRepository.getByVerificationCode({
          verificationCode,
        });

        // then
        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          lastName,
          firstName,
          birthdate,
          status: 'validated',
          pixScore: 327,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
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
          maxReachableLevel: 7,
        });
        expect(results).to.deep.equal([expectedCertification]);
      });

      it('should fallback to MESH_CONFIGURATION size when scoring_configuration is null', async function () {
        // given
        const verificationCode = 'P-1234567A';
        const lastName = 'LEPONGE';
        const firstName = 'Bob';
        const birthdate = '2000-01-01';
        datamartBuilder.factory.buildCertificationResultCodeValidation({
          verificationCode,
          lastName,
          firstName,
          birthdate,
          status: 'validated',
          pixScore: 327,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          competenceCode: '1.1',
          competenceName: "Mener une recherche et une veille d'information",
          areaName: 'Informations et données',
          competenceLevel: 3,
          configuration: null,
        });
        await datamartBuilder.commit();

        // when
        const results = await certificationRepository.getByVerificationCode({
          verificationCode,
        });

        // then
        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          lastName,
          firstName,
          birthdate,
          status: 'validated',
          pixScore: 327,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          competences: [
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.1',
              name: "Mener une recherche et une veille d'information",
              areaName: 'Informations et données',
              level: 3,
            }),
          ],
          maxReachableLevel: 7,
        });
        expect(results).to.deep.equal([expectedCertification]);
      });

      it('should keep only one competence by competence code', async function () {
        // given
        const verificationCode = 'P-1234567A';
        const lastName = 'LEPONGE';
        const firstName = 'Bob';
        const birthdate = '2000-01-01';
        const certificationResultData = {
          verificationCode,
          lastName,
          firstName,
          birthdate,
          status: 'validated',
          pixScore: 327,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
        };
        const duplicatedCompetency = {
          ...certificationResultData,
          competenceCode: '1.1',
          competenceName: "Mener une recherche et une veille d'information",
          areaName: 'Informations et données',
          competenceLevel: 3,
        };
        datamartBuilder.factory.buildCertificationResultCodeValidation({
          ...certificationResultData,
          ...duplicatedCompetency,
        });
        datamartBuilder.factory.buildCertificationResultCodeValidation({
          ...certificationResultData,
          ...duplicatedCompetency,
        });
        await datamartBuilder.commit();

        // when
        const results = await certificationRepository.getByVerificationCode({
          verificationCode,
        });

        // then
        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          lastName,
          firstName,
          birthdate,
          status: 'validated',
          pixScore: 327,
          certificationDate: new Date('2024-11-22T09:39:54Z'),
          competences: [
            domainBuilder.certification.results.parcoursup.buildCompetence({
              code: '1.1',
              name: "Mener une recherche et une veille d'information",
              areaName: 'Informations et données',
              level: 3,
            }),
          ],
          maxReachableLevel: 7,
        });
        expect(results).to.deep.equal([expectedCertification]);
      });
    });

    describe('when no certifications are found for a given verification code, first name and last name', function () {
      it('should throw Not Found Error', async function () {
        // given
        const verificationCode = 'P-1234567B';

        // when
        const err = await catchErr(certificationRepository.getByVerificationCode)({
          verificationCode,
        });

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.deep.equal('No certifications found for given search parameters');
      });
    });
  });
});
