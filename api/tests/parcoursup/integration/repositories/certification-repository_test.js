import * as certificationRepository from '../../../../../api/src/parcoursup/infrastructure/repositories/certification-repository.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { catchErr, datamartBuilder, domainBuilder, expect } from '../../../test-helper.js';

describe('Parcoursup | Infrastructure | Integration | Repositories | certification', function () {
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
          certificationDate: '2024-11-22T09:39:54',
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

        // when
        const results = await certificationRepository.getByINE({ ine });

        // then
        const expectedCertification = domainBuilder.parcoursup.buildCertificationResult({
          ine,
          organizationUai: 'UAI ETAB ELEVE',
          lastName: 'NOM-ELEVE',
          firstName: 'PRENOM-ELEVE',
          birthdate: '2000-01-01',
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
          certificationDate: '2024-11-22T09:39:54',
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

        // when
        const results = await certificationRepository.getByOrganizationUAI({
          organizationUai,
          lastName,
          firstName,
          birthdate,
        });

        // then
        const expectedCertification = domainBuilder.parcoursup.buildCertificationResult({
          ine: '1234',
          organizationUai,
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
          certificationDate: '2024-11-22T09:39:54',
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

        // when
        const results = await certificationRepository.getByVerificationCode({
          verificationCode,
        });

        // then
        const expectedCertification = domainBuilder.parcoursup.buildCertificationResult({
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
