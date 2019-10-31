const { expect } = require('../../test-helper');
const organizeOrganizationsByExternalId = require('../../../scripts/organizeOrganizationsByExternalId');

describe('Unit | Scripts | organizeOrganizationsByExternalId.js', () => {

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

});
