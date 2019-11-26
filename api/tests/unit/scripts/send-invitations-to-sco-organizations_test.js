const { expect, nock } = require('../../test-helper');
const { checkData, sendInvitations } = require('../../../scripts/send-invitations-to-sco-organizations');

describe('Unit | Scripts | send-invitations-to-sco-organizations.js', () => {

  afterEach(() => {
    nock.cleanAll();
  });

  describe('#sendInvitations', () => {

    it('should update organizations and send invitations', async () => {
      // given
      const accessToken = 'token';

      const organizationsByExternalId = {
        A100: {
          id: 1,
          'external-id': 'A10',
        },
      };

      const checkedData = [
        { externalId: 'A100', email: 'superpix@pix.fr' },
      ];

      const expectedPostBody = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'superpix@pix.fr'
          },
        },
      };

      let postCallCount = 0;

      const networkStub = nock(
        'http://localhost:3000',
        {
          reqheaders: {
            authorization: 'Bearer token',
          },
        }
      )
        .post('/api/organizations/1/invitations', (body) => JSON.stringify(body) === JSON.stringify(expectedPostBody))
        .reply(201, () => {
          postCallCount++;

          return {};
        });

      // when
      await sendInvitations({ accessToken, checkedData, organizationsByExternalId });

      // then
      expect(networkStub.isDone()).to.be.true;
      expect(postCallCount).to.be.equal(1);
    });
  });

  describe('#checkData', () => {

    it('should keep all data', async () => {
      // given
      const csvData = [
        ['a100', 'truc@example.net'],
        ['b200', 'muche@example.org'],
      ];

      const expectedResult = [{
        externalId: 'A100',
        email: 'truc@example.net'
      }, {
        externalId: 'B200',
        email: 'muche@example.org'
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when a whole line is empty', async () => {
      // given
      const csvData = [
        ['a100', 'truc@example.net'],
        ['', ''],
      ];

      const expectedResult = [{
        externalId: 'A100',
        email: 'truc@example.net'
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when an externalId is missing', async () => {
      // given
      const csvData = [
        ['a100', 'truc@example.net'],
        ['', 'muche@example.org'],
      ];

      const expectedResult = [{
        externalId: 'A100',
        email: 'truc@example.net'
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when email is missing', async () => {
      // given
      const csvData = [
        ['a100', 'truc@example.net'],
        ['b200', ''],
      ];

      const expectedResult = [{
        externalId: 'A100',
        email: 'truc@example.net'
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });
  });
});
