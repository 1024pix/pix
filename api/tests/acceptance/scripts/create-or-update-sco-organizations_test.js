const { expect, nock } = require('../../test-helper');

const { checkData, createOrUpdateOrganizations } = require('../../../scripts/create-or-update-sco-organizations');
const logoUrl = require('../../../scripts/logo/default-sco-organization-logo-base64');

describe('Acceptance | Scripts | create-or-update-sco-organizations.js', () => {

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

      const checkedData = [
        { externalId: 'A100', name: 'Lycée Jean Moulin' }, // untouched
        { externalId: 'B200', name: 'Lycée Technique Jean Guedin' }, // updated
        { externalId: 'C300', name: 'Lycée Professionnel Jean Rémy' }, // created
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
        },
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
        },
      )
        .post('/api/organizations', (body) => JSON.stringify(body) === JSON.stringify(expectedPostBody))
        .reply(201, () => {
          postCallCount++;

          return {};
        });

      // when
      await createOrUpdateOrganizations({ accessToken, organizationsByExternalId, checkedData });

      // then
      expect(networkStub1.isDone()).to.be.true;
      expect(networkStub2.isDone()).to.be.true;
      expect(postCallCount).to.be.equal(1);
      expect(patchCallCount).to.be.equal(1);
    });
  });

  describe('#checkData', () => {

    it('should keep all data', async () => {
      // given
      const csvData = [
        ['a100', 'Lycée Charles De Gaulle'],
        ['b200', 'Collège Marie Curie'],
      ];

      const expectedResult = [{
        externalId: 'A100',
        name: 'Lycée Charles De Gaulle',
      }, {
        externalId: 'B200',
        name: 'Collège Marie Curie',
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when a whole line is empty', async () => {
      // given
      const csvData = [
        ['a100', 'Lycée Charles De Gaulle'],
        ['', ''],
      ];

      const expectedResult = [{
        externalId: 'A100',
        name: 'Lycée Charles De Gaulle',
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when an externalId is missing', async () => {
      // given
      const csvData = [
        ['a100', 'Lycée Charles De Gaulle'],
        ['', 'Collège Marie Curie'],
      ];

      const expectedResult = [{
        externalId: 'A100',
        name: 'Lycée Charles De Gaulle',
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when name is missing', async () => {
      // given
      const csvData = [
        ['a100', 'Lycée Charles De Gaulle'],
        ['b200', ''],
      ];

      const expectedResult = [{
        externalId: 'A100',
        name: 'Lycée Charles De Gaulle',
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });
  });

});
