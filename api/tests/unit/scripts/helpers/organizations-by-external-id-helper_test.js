import { expect, sinon } from '../../../test-helper';
import {
  findOrganizationsByExternalIds,
  organizeOrganizationsByExternalId,
} from '../../../../scripts/helpers/organizations-by-external-id-helper';
import organizationRepository from '../../../../lib/infrastructure/repositories/organization-repository';

describe('Unit | Scripts | organizations-by-external-id-helper.js', function () {
  describe('#organizeOrganizationsByExternalId', function () {
    it('should return organizations data by externalId', function () {
      // given
      const organizations = [
        { id: 1, externalId: 'a100' },
        { id: 2, externalId: 'b200' },
      ];

      const expectedResult = {
        a100: {
          id: 1,
          externalId: 'a100',
        },
        b200: {
          id: 2,
          externalId: 'b200',
        },
      };

      // when
      const result = organizeOrganizationsByExternalId(organizations);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#findOrganizationsByExternalIds', function () {
    let organizationRepositoryStub;

    afterEach(function () {
      sinon.restore();
    });

    it('should find organizations with given externalIds', async function () {
      // given
      const checkedData = [
        { externalId: 'A100', targetProfileIdList: ['1', '2', '999'] },
        { externalId: 'B200', targetProfileIdList: ['1', '3', '6'] },
      ];
      organizationRepositoryStub = sinon
        .stub(organizationRepository, 'findByExternalIdsFetchingIdsOnly')
        .withArgs(['A100', 'B200'])
        .resolves([]);

      // when
      await findOrganizationsByExternalIds({ checkedData });

      // then
      expect(organizationRepositoryStub).to.have.been.calledOnce;
    });
  });
});
