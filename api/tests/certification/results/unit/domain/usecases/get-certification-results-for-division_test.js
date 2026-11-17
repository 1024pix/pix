import { expect } from 'chai';
import sinon from 'sinon';

import { NoCertificationResultForDivision } from '../../../../../../src/certification/results/domain/errors.js';
import { getCertificationResultsForDivision } from '../../../../../../src/certification/results/domain/usecases/get-certification-results-for-division.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr, preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Use Cases | get-certification-results-for-division', function () {
  let organizationLearnerAdapter, certificationResultForCsvRepository, dependencies;
  const organizationId = 123;
  const division = '3èmeC';

  beforeEach(function () {
    organizationLearnerAdapter = {
      findInOrganizationByDivision: sinon.stub(),
    };
    certificationResultForCsvRepository = {
      findMostRecentByLearners: sinon.stub(),
    };

    preventStubsToBeCalledUnexpectedly([
      organizationLearnerAdapter.findInOrganizationByDivision,
      certificationResultForCsvRepository.findMostRecentByLearners,
    ]);

    dependencies = {
      organizationLearnerAdapter,
      certificationResultForCsvRepository,
    };
  });

  describe('when there are no learners for given orga and division', function () {
    it('should throw a NoCertificationResultForDivision error', async function () {
      // given
      organizationLearnerAdapter.findInOrganizationByDivision.withArgs({ organizationId, division }).resolves([]);

      // when
      const err = await catchErr(getCertificationResultsForDivision)({
        organizationId,
        division,
        ...dependencies,
      });

      // then
      expect(err).to.be.instanceOf(NoCertificationResultForDivision);
    });
  });

  describe('when there are no results for given learners', function () {
    it('should throw a NoCertificationResultForDivision error', async function () {
      // given
      const foundLearner1 = domainBuilder.certification.results.buildLearner({ id: 123 });
      const foundLearner2 = domainBuilder.certification.results.buildLearner({ id: 456 });
      organizationLearnerAdapter.findInOrganizationByDivision
        .withArgs({ organizationId, division })
        .resolves([foundLearner1, foundLearner2]);
      certificationResultForCsvRepository.findMostRecentByLearners.withArgs({ learnerIds: [123, 456] }).resolves([]);

      // when
      const err = await catchErr(getCertificationResultsForDivision)({
        organizationId,
        division,
        ...dependencies,
      });

      // then
      expect(err).to.be.instanceOf(NoCertificationResultForDivision);
    });
  });

  context('when there are results for learners', function () {
    it('returns the results', async function () {
      // given
      const foundLearner1 = domainBuilder.certification.results.buildLearner({ id: 123 });
      const foundLearner2 = domainBuilder.certification.results.buildLearner({ id: 456 });
      organizationLearnerAdapter.findInOrganizationByDivision
        .withArgs({ organizationId, division })
        .resolves([foundLearner1, foundLearner2]);
      const certifResult1 = Symbol('certif1');
      const certifResult2 = Symbol('certif2');
      certificationResultForCsvRepository.findMostRecentByLearners
        .withArgs({ learnerIds: [123, 456] })
        .resolves([certifResult1, certifResult2]);

      // when
      const certificationResults = await getCertificationResultsForDivision({
        organizationId,
        division,
        ...dependencies,
      });

      // then
      expect(certificationResults).to.deep.equal([certifResult1, certifResult2]);
    });
  });
});
