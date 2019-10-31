const { expect, nock } = require('../../test-helper');

const { organizeOrganizationsByExternalId, createOrUpdateOrganizations } = require('../../../scripts/create-or-update-sco-organizations');
const logoUrl = require('../../../scripts/default-sco-organization-logo-base64');

describe('Acceptance | Scripts | create-or-update-sco-organizations.js', () => {

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

    it('should create or update organizations', async () => {
      // given
      const accessToken = 'token';

      const organizationsByExternalId = {
        A100: {
          id: 1,
          name: 'Lycée Jean Moulin',
          'external-id': 'A100',
          'logo-url': logoUrl,
        },
        B200: {
          id: 2,
          name: 'Lycée Jean Guedin',
          'external-id': 'B200',
        },
      };

      const csvData = [
        ['a100', 'Lycée Jean Moulin'], // untouched
        ['b200', 'Lycée Technique Jean Guedin'], // updated
        ['C300', 'Lycée Professionnel Jean Rémy'], // created
      ];

      const expectedPatchBody = {
        data: {
          type: 'organizations',
          id: 2,
          attributes: {
            name: 'Lycée Technique Jean Guedin',
            'logo-url': logoUrl,
          },
        },
      };

      const expectedPostBody = {
        data: {
          type: 'organizations',
          attributes: {
            name: 'Lycée Professionnel Jean Rémy',
            type: 'SCO',
            'external-id': 'C300',
            'province-code': 'C30',
            'logo-url': logoUrl,
          },
        },
      };

      let postCallCount = 0;
      let patchCallCount = 0;

      const networkStub1 = nock(
        'http://localhost:3000',
        {
          reqheaders: {
            authorization: 'Bearer token',
          },
        }
      )
        .patch('/api/organizations/2', (body) => JSON.stringify(body) === JSON.stringify(expectedPatchBody))
        .reply(204, () => {
          patchCallCount++;

          return {};
        });

      const networkStub2 = nock(
        'http://localhost:3000',
        {
          reqheaders: {
            authorization: 'Bearer token',
          },
        }
      )
        .post('/api/organizations', (body) => JSON.stringify(body) === JSON.stringify(expectedPostBody))
        .reply(201, () => {
          postCallCount++;

          return {};
        });

      // when
      await createOrUpdateOrganizations({ accessToken, organizationsByExternalId, csvData });

      // then
      expect(networkStub1.isDone()).to.be.true;
      expect(networkStub2.isDone()).to.be.true;
      expect(postCallCount).to.be.equal(1);
      expect(patchCallCount).to.be.equal(1);
    });
  });

});
