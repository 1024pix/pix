import sinon from 'sinon';

import { findDivisionsByCertificationCenter } from '../../../../../../src/certification/enrolment/domain/usecases/find-divisions-by-certification-center.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | find-divisions-by-certification-center', function () {
  let organization;
  let centerRepository;
  let divisionRepository;

  beforeEach(async function () {
    centerRepository = {
      findActiveScoOrganizationId: sinon.stub(),
    };
    divisionRepository = {
      findActiveDivisionsByOrganizationId: sinon.stub(),
    };
  });

  describe('when user has access to certification center', function () {
    it('should return all divisions', async function () {
      // given
      const externalId = 'AAA111';
      const certificationCenter = domainBuilder.buildCertificationCenter({ externalId });
      organization = domainBuilder.buildOrganization({ externalId });

      centerRepository.findActiveScoOrganizationId
        .withArgs({ certificationCenterId: certificationCenter.id })
        .resolves(organization.id);
      divisionRepository.findActiveDivisionsByOrganizationId
        .withArgs({ organizationId: organization.id })
        .resolves([{ name: '3a' }, { name: '3b' }, { name: '5c' }]);

      // when
      const divisions = await findDivisionsByCertificationCenter({
        certificationCenterId: certificationCenter.id,
        centerRepository,
        divisionRepository,
      });

      // then
      expect(divisions).to.be.deep.equal([{ name: '3a' }, { name: '3b' }, { name: '5c' }]);
    });

    describe('when the certification center has no active organization', function () {
      it('should throw a not found error', async function () {
        // given
        const certificationCenter = domainBuilder.buildCertificationCenter();
        organization = domainBuilder.buildOrganization({ externalId: certificationCenter.externalId });

        centerRepository.findActiveScoOrganizationId
          .withArgs({ certificationCenterId: certificationCenter.id })
          .resolves(null);

        // when
        const error = await catchErr(findDivisionsByCertificationCenter)({
          certificationCenterId: certificationCenter.id,
          centerRepository,
          divisionRepository,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('No organization found for this certification center');
      });
    });
  });
});
