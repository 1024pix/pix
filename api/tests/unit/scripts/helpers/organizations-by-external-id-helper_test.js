const { expect, sinon } = require('../../../test-helper');

const { findOrganizationsByExternalIds, organizeOrganizationsByExternalId } = require('../../../../scripts/helpers/organizations-by-external-id-helper');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');

describe('Unit | Scripts | organizations-by-external-id-helper.js', () => {

  describe('#organizeOrganizationsByExternalId', () => {

    it('should return organizations data by externalId', () => {
      // given
      const organizations = [
        { id: 1, externalId: 'a100' },
        { id: 2, externalId: 'b200' },
      ];

      const expectedResult = {
        A100: {
          id: 1,
          externalId: 'A100',
        },
        B200: {
          id: 2,
          externalId: 'B200',
        },
      };

      // when
      const result = organizeOrganizationsByExternalId(organizations);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#findOrganizationsByExternalIds', () => {

    let organizationRepositoryStub;

    afterEach(() => {
      sinon.restore();
    });

    it('should find organizations with given externalIds', async () => {
      // given
      const checkedData = [
        { externalId: 'A100', targetProfileIdList: ['1', '2', '999'] },
        { externalId: 'B200', targetProfileIdList: ['1', '3', '6'] }
      ];
      organizationRepositoryStub = sinon.stub(organizationRepository, 'findByExternalIdsFetchingIdsOnly').withArgs(['A100', 'B200']).resolves([]);

      // when
      await findOrganizationsByExternalIds({ checkedData });

      // then
      expect(organizationRepositoryStub).to.have.been.calledOnce;
    });
  });

});
