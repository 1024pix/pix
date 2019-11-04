const { expect, nock } = require('../../test-helper');

const { organizeOrganizationsByExternalId, updateOrganizations } = require('../../../scripts/update-sco-organizations-with-is-managing-students-to-true');

describe('Acceptance | Scripts | update-sco-organizations-with-is-managing-students-to-true.js', () => {

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

  describe('#updateOrganizations', () => {

    it('should update organizations', async () => {
      // given
      const accessToken = 'token';

      const organizationsByExternalId = {
        A100: {
          id: 1,
          'is-managing-students': false,
        },
      };

      const csvData = [
        ['a100', 'true'],
      ];

      const expectedPatchBody = {
        data: {
          type: 'organizations',
          id: 1,
          attributes: {
            'is-managing-students': true,
          },
        },
      };

      let patchCallCount = 0;

      const networkStub = nock(
        'http://localhost:3000',
        {
          reqheaders: {
            authorization: 'Bearer token',
          },
        }
      )
        .patch('/api/organizations/1', (body) => JSON.stringify(body) === JSON.stringify(expectedPatchBody))
        .reply(204, () => {
          patchCallCount++;

          return {};
        });

      // when
      await updateOrganizations({ accessToken, organizationsByExternalId, csvData });

      // then
      expect(networkStub.isDone()).to.be.true;
      expect(patchCallCount).to.be.equal(1);
    });
  });

});
