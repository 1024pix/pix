const { expect, sinon } = require('../../test-helper');

const { addTargetProfileSharesToOrganizations, checkData } = require('../../../scripts/add-target-profile-shares-to-organizations');
const targetProfileShareRepository = require('../../../lib/infrastructure/repositories/target-profile-share-repository');

describe('Acceptance | Scripts | add-target-profile-shares-to-organizations.js', () => {

  describe('#addTargetProfileSharesToOrganizations', () => {

    let targetProfileShareRepositoryStub;
    beforeEach(() => {
      targetProfileShareRepositoryStub = sinon.stub(targetProfileShareRepository, 'addTargetProfilesToOrganization').resolves({});
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

      const checkedData = [
        { externalId: 'A100', targetProfileIdList: ['1', '2', '999'] },
        { externalId: 'B200', targetProfileIdList: ['1', '3', '6'] }
      ];

      // when
      await addTargetProfileSharesToOrganizations({ organizationsByExternalId, checkedData });

      // then
      expect(targetProfileShareRepositoryStub).to.have.been.calledTwice;
    });
  });

  describe('#checkData', () => {

    it('should keep all data', async () => {
      // given
      const csvData = [
        ['a100', '1-2-999'],
        ['b200', '1-3-6'],
      ];

      const expectedResult = [{
        externalId: 'A100',
        targetProfileIdList: [
          '1',
          '2',
          '999',
        ]
      }, {
        externalId: 'B200',
        targetProfileIdList: [
          '1',
          '3',
          '6',
        ]
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when a whole line is empty', async () => {
      // given
      const csvData = [
        ['a100', '1-2-999'],
        ['', ''],
      ];

      const expectedResult = [{
        externalId: 'A100',
        targetProfileIdList: [
          '1',
          '2',
          '999',
        ]
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when an externalId is missing', async () => {
      // given
      const csvData = [
        ['a100', '1-2-999'],
        ['', '1-3-6'],
      ];

      const expectedResult = [{
        externalId: 'A100',
        targetProfileIdList: [
          '1',
          '2',
          '999',
        ]
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when targetProfileIds is missing', async () => {
      // given
      const csvData = [
        ['a100', '1-2-999'],
        ['b200', ''],
      ];

      const expectedResult = [{
        externalId: 'A100',
        targetProfileIdList: [
          '1',
          '2',
          '999',
        ]
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep all data except the empty targetProfileId', async () => {
      // given
      const csvData = [
        ['a100', '1-2-999'],
        ['b200', '1-3-'],
      ];

      const expectedResult = [{
        externalId: 'A100',
        targetProfileIdList: [
          '1',
          '2',
          '999',
        ]
      }, {
        externalId: 'B200',
        targetProfileIdList: [
          '1',
          '3',
        ]
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should accept spaces', async () => {
      // given
      const csvData = [
        ['a100', '1-2-999'],
        ['b200', '1 - 3 - 6'],
      ];

      const expectedResult = [{
        externalId: 'A100',
        targetProfileIdList: [
          '1',
          '2',
          '999',
        ]
      }, {
        externalId: 'B200',
        targetProfileIdList: [
          '1 ',
          ' 3 ',
          ' 6'
        ]
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });
  });

});
