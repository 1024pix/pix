const { expect, sinon } = require('../../test-helper');

const { organizeOrganizationsByExternalId, addTargetProfileSharesToOrganizations } = require('../../../scripts/add-target-profile-shares-to-organizations');
const targetProfileShareRepo = require('../../../lib/infrastructure/repositories/target-profile-share-repository');

describe('Acceptance | Scripts | add-target-profile-shares-to-organizations.js', () => {

  describe('#organizeOrganizationsByExternalId', () => {

    it('should return organizations data by externalId', () => {
      // given
      const data = [
        {
          id: 1,
          attributes: {
            name: 'Lycée Jean Moulin',
            'external-id': 'a100',
          },
        },
        {
          id: 2,
          attributes: {
            name: 'Lycée Jean Guedin',
            'external-id': 'b200',
          },
        },
      ];

      const expectedResult = {
        A100: {
          id: 1,
          name: 'Lycée Jean Moulin',
          'external-id': 'A100',
        },
        B200: {
          id: 2,
          name: 'Lycée Jean Guedin',
          'external-id': 'B200',
        },
      };

      // when
      const result = organizeOrganizationsByExternalId(data);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#createOrUpdateOrganizations', () => {

    let targetProfileShareRepoStub;
    beforeEach(() => {
      targetProfileShareRepoStub = sinon.stub(targetProfileShareRepo, 'addToOrganization').resolves({});
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should add target profile shares to the given organization', async () => {
      // given
      const organizationsByExternalId = {
        A100: {
          id: 1,
          name: 'Lycée Jean Moulin',
          'external-id': 'A100',
        },
        B200: {
          id: 2,
          name: 'Lycée Jean Guedin',
          'external-id': 'B200',
        },
      };

      const csvData = [
        ['a100', '1-2-999'],
        ['b200', '1-3-6'],
      ];

      // when
      await addTargetProfileSharesToOrganizations({ organizationsByExternalId, csvData });

      // then
      expect(targetProfileShareRepoStub).to.have.been.calledTwice;
    });
  });

});
