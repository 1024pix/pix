import { NoCertificationResultForDivision } from '../../../../../../src/certification/results/domain/errors.js';
import { getScoCertificationResultsByDivision } from '../../../../../../src/certification/results/domain/usecases/get-sco-certification-results-by-division.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Course | Unit | UseCase | get-sco-certification-results-by-division', function () {
  const scoCertificationCandidateRepository = { findIdsByOrganizationIdAndDivision: null };
  const certificationResultRepository = { findByCertificationCandidateIds: null };
  const dependencies = {
    scoCertificationCandidateRepository,
    certificationResultRepository,
  };

  beforeEach(function () {
    scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision = sinon.stub();
    certificationResultRepository.findByCertificationCandidateIds = sinon.stub();
  });

  it('throws when no candidates are found for organization and division', async function () {
    // given
    scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision
      .withArgs({
        organizationId: 1,
        division: '3ème A',
      })
      .resolves([]);
    certificationResultRepository.findByCertificationCandidateIds.rejects('I should not be called');

    // when
    const error = await catchErr(getScoCertificationResultsByDivision)({
      ...dependencies,
      organizationId: 1,
      division: '3ème A',
    });

    // then
    expect(error).to.deepEqualInstance(new NoCertificationResultForDivision());
  });

  it('throws when no results are found for candidates', async function () {
    // given
    scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision
      .withArgs({
        organizationId: 1,
        division: '3ème A',
      })
      .resolves([11, 12]);
    certificationResultRepository.findByCertificationCandidateIds
      .withArgs({
        certificationCandidateIds: [11, 12],
      })
      .resolves([]);

    // when
    const error = await catchErr(getScoCertificationResultsByDivision)({
      ...dependencies,
      organizationId: 1,
      division: '3ème A',
    });

    // then
    expect(error).to.be.instanceof(NoCertificationResultForDivision);
  });

  it('returns the certification results of candidates matching the organization and division', async function () {
    // given
    scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision
      .withArgs({
        organizationId: 1,
        division: '3ème A',
      })
      .resolves([11, 12, 13]);
    const certificationResultA = domainBuilder.buildCertificationResult({ firstName: 'Buffy' });
    const certificationResultB = domainBuilder.buildCertificationResult({ firstName: 'Giles' });
    certificationResultRepository.findByCertificationCandidateIds
      .withArgs({
        certificationCandidateIds: [11, 12, 13],
      })
      .resolves([certificationResultA, certificationResultB]);

    // when
    const certificationResults = await getScoCertificationResultsByDivision({
      ...dependencies,
      organizationId: 1,
      division: '3ème A',
    });

    // then
    expect(certificationResults).to.deepEqualArray([certificationResultA, certificationResultB]);
  });
});
