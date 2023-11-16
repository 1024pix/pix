import { expect, sinon, domainBuilder, catchErr } from '../../../../../test-helper.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { getCertificationAttestation } from '../../../../../../src/certification/course/domain/usecases/get-certification-attestation.js';

describe('Unit | UseCase | get-certification-attestation', function () {
  let certificateRepository;

  beforeEach(function () {
    certificateRepository = { getCertificationAttestation: sinon.stub() };
  });

  context('when the user is not owner of the certification attestation', function () {
    it('should throw an error if user is not the owner of the certificationAttestation', async function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        id: 123,
        userId: 456,
      });
      certificateRepository.getCertificationAttestation.withArgs(123).resolves(certificationAttestation);

      // when
      const error = await catchErr(getCertificationAttestation)({
        certificationId: 123,
        userId: 789,
        certificateRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is owner of the certification attestation', function () {
    it('should return the certification attestation enhanced with result competence tree', async function () {
      // given
      const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({ id: 'myResultTreeId' });
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        id: 123,
        userId: 456,
        resultCompetenceTree,
      });
      certificateRepository.getCertificationAttestation.withArgs(123).resolves(certificationAttestation);

      // when
      const actualCertificationAttestation = await getCertificationAttestation({
        certificationId: 123,
        userId: 456,
        certificateRepository,
      });

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation({
        id: 123,
        userId: 456,
        resultCompetenceTree,
      });
      expect(actualCertificationAttestation).to.deep.equal(expectedCertificationAttestation);
    });
  });
});
