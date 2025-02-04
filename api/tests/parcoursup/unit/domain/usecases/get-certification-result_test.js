import { MoreThanOneMatchingCertificationError } from '../../../../../src/parcoursup/domain/errors.js';
import { getCertificationResult } from '../../../../../src/parcoursup/domain/usecases/get-certification-result.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Parcoursup | Unit | Domain | UseCase | getCertificationResult', function () {
  describe('#getCertificationResult', function () {
    it('should not allow more than one result', async function () {
      // given
      const ine = '1234';
      const certificationRepository = {
        getByINE: sinon.stub(),
      };

      const oneCertification = domainBuilder.parcoursup.buildCertificationResult({ ine });
      const duplicatedCertification = domainBuilder.parcoursup.buildCertificationResult({ ine });
      certificationRepository.getByINE.withArgs({ ine }).resolves([oneCertification, duplicatedCertification]);

      // when
      const error = await catchErr(getCertificationResult)({ ine, certificationRepository });

      // then
      expect(error).to.be.instanceOf(MoreThanOneMatchingCertificationError);
      expect(error.message).to.equal('More than one candidate found for current search parameters');
    });

    context('with INE', function () {
      it('returns matching certification', async function () {
        // given
        const ine = '1234';
        const certificationRepository = {
          getByINE: sinon.stub(),
        };

        const expectedCertification = domainBuilder.parcoursup.buildCertificationResult({ ine });
        certificationRepository.getByINE.withArgs({ ine }).resolves([expectedCertification]);

        // when
        const certification = await getCertificationResult({ ine, certificationRepository });

        // then
        expect(certification).to.deep.equal(expectedCertification);
      });
    });

    context('with organizationUai, last name, first name and birthdate', function () {
      it('returns matching certification', async function () {
        // given
        const organizationUai = '1234567A';
        const lastName = 'LEPONGE';
        const firstName = 'Bob';
        const birthdate = '2000-01-01';
        const certificationRepository = {
          getByOrganizationUAI: sinon.stub(),
        };

        const expectedCertification = domainBuilder.parcoursup.buildCertificationResult({
          organizationUai,
          lastName,
          firstName,
          birthdate,
        });
        certificationRepository.getByOrganizationUAI
          .withArgs({
            organizationUai,
            lastName,
            firstName,
            birthdate,
          })
          .resolves([expectedCertification]);

        // when
        const certification = await getCertificationResult({
          organizationUai,
          lastName,
          firstName,
          birthdate,
          certificationRepository,
        });

        // then
        expect(certification).to.deep.equal(expectedCertification);
      });
    });

    context('with a verification code', function () {
      it('returns matching certification', async function () {
        // given
        const verificationCode = 'P-1234567A';
        const certificationRepository = {
          getByVerificationCode: sinon.stub(),
        };

        const expectedCertification = domainBuilder.parcoursup.buildCertificationResult({
          verificationCode,
        });
        certificationRepository.getByVerificationCode
          .withArgs({
            verificationCode,
          })
          .resolves([expectedCertification]);

        // when
        const certification = await getCertificationResult({
          verificationCode,
          certificationRepository,
        });

        // then
        expect(certification).to.deep.equal(expectedCertification);
      });
    });
  });
});
