const { expect, nock } = require('../../test-helper');
const { sendInvitations } = require('../../../scripts/send-invitations-to-sco-organizations');

describe('Integration | Scripts | send-invitations-to-sco-organizations.js', () => {

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
          name: 'Lycée Jean Moulin',
          'external-id': 'A10',
        },
      };

      const data = [
        ['A100', 'Lycée Jean Moulin', 'superpix@pix.fr'],
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
      await sendInvitations(accessToken, data, organizationsByExternalId);

      // then
      expect(networkStub.isDone()).to.be.true;
      expect(postCallCount).to.be.equal(1);
    });
  });
});
