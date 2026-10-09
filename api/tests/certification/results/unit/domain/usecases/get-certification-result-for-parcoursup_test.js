import { expect } from 'chai';
import sinon from 'sinon';

import { MoreThanOneMatchingCertificationError } from '../../../../../../src/certification/results/domain/errors.js';
import { getCertificationResultForParcoursup } from '../../../../../../src/certification/results/domain/usecases/get-certification-result-for-parcoursup.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Results | Unit | Domain | UseCase | getCertificationResultForParcoursup', function () {
  describe('#getCertificationResultForParcoursup', function () {
    it('should not allow more than one result', async function () {
      // given
      const ine = '1234';
      const parcoursupCertificationResultRepository = {
        getByINE: sinon.stub(),
      };

      const oneCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
        ine,
        score: 112,
        maxReachableLevel: 7,
      });
      const duplicatedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
        ine,
        score: 323,
        maxReachableLevel: 7,
      });
      parcoursupCertificationResultRepository.getByINE
        .withArgs({ ine })
        .resolves([oneCertification, duplicatedCertification]);

      // when
      const error = await catchErr(getCertificationResultForParcoursup)({
        ine,
        parcoursupCertificationResultRepository,
      });

      // then
      expect(error).to.be.instanceOf(MoreThanOneMatchingCertificationError);
      expect(error.message).to.equal('More than one candidate found for current search parameters');
    });

    context('with INE', function () {
      it('returns matching certification', async function () {
        // given
        const ine = '1234';
        const parcoursupCertificationResultRepository = {
          getByINE: sinon.stub(),
        };

        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          ine,
          score: 323,
          maxReachableLevel: 7,
        });
        parcoursupCertificationResultRepository.getByINE.withArgs({ ine }).resolves([expectedCertification]);

        // when
        const certification = await getCertificationResultForParcoursup({
          ine,
          parcoursupCertificationResultRepository,
        });

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
        const parcoursupCertificationResultRepository = {
          getByOrganizationUAI: sinon.stub(),
        };

        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          organizationUai,
          lastName,
          firstName,
          birthdate,
          score: 323,
          maxReachableLevel: 7,
        });
        parcoursupCertificationResultRepository.getByOrganizationUAI
          .withArgs({
            organizationUai,
            lastName,
            firstName,
            birthdate,
          })
          .resolves([expectedCertification]);

        // when
        const certification = await getCertificationResultForParcoursup({
          organizationUai,
          lastName,
          firstName,
          birthdate,
          parcoursupCertificationResultRepository,
        });

        // then
        expect(certification).to.deep.equal(expectedCertification);
      });
    });

    context('with a verification code', function () {
      it('returns matching certification', async function () {
        // given
        const verificationCode = 'P-123b5c7a';
        const upperCasedVerificationCode = 'P-123B5C7A';
        const parcoursupCertificationResultRepository = {
          getByVerificationCode: sinon.stub(),
        };

        const expectedCertification = domainBuilder.certification.results.parcoursup.buildCertificationResult({
          verificationCode: upperCasedVerificationCode,
          score: 323,
          maxReachableLevel: 7,
        });
        parcoursupCertificationResultRepository.getByVerificationCode
          .withArgs({
            verificationCode: upperCasedVerificationCode,
          })
          .resolves([expectedCertification]);

        // when
        const certification = await getCertificationResultForParcoursup({
          verificationCode,
          parcoursupCertificationResultRepository,
        });

        // then
        expect(certification).to.deep.equal(expectedCertification);
      });
    });
  });
});
