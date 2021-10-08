const { expect, sinon, domainBuilder } = require('../../../test-helper');

const findDivisionsByCertificationCenter = require('../../../../lib/domain/usecases/find-divisions-by-certification-center');

describe('Unit | UseCase | find-divisions-by-certification-center', function () {
  const certificationCenterId = 1;
  let organization;

  const organizationRepository = {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    getIdByCertificationCenterId: sinon.stub(),
  };
  const divisionRepository = {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    findByOrganizationIdForCurrentSchoolYear: sinon.stub(),
  };

  beforeEach(async function () {
    const externalId = 'AAA111';
    const certificationCenter = domainBuilder.buildCertificationCenter({ id: certificationCenterId, externalId });
    organization = domainBuilder.buildOrganization({ externalId });

    organizationRepository.getIdByCertificationCenterId.withArgs(certificationCenter.id).resolves(organization.id);
  });

  describe('when user has access to certification center', function () {
    it('should return all divisions', async function () {
      // given
      divisionRepository.findByOrganizationIdForCurrentSchoolYear
        .withArgs({ organizationId: organization.id })
        .resolves([{ name: '3a' }, { name: '3b' }, { name: '5c' }]);

      // when
      const divisions = await findDivisionsByCertificationCenter({
        certificationCenterId,
        organizationRepository,
        divisionRepository,
      });

      // then
      expect(divisions).to.be.deep.equal([{ name: '3a' }, { name: '3b' }, { name: '5c' }]);
    });
  });
});
