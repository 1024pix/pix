const { expect, nock } = require('../../test-helper');
const { updateOrganizationsAndSendInvitations } = require('../../../scripts/send-invitations-to-sco-organizations');

describe('Integration | Scripts | send-invitations-to-sco-organizations.js', () => {

  afterEach(() => {
    nock.cleanAll();
  });

  describe('#updateOrganizationsAndSendInvitations', () => {

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

      const expectedPatchBody = {
        data: {
          type: 'organizations',
          id: 1,
          attributes: {
            isManagingStudents: true,
          },
        },
      };

      const expectedPostBody = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'superpix@pix.fr'
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
        .patch('/api/organizations/1', (body) => JSON.stringify(body) === JSON.stringify(expectedPatchBody))
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
        .post('/api/organizations/1/invitations', (body) => JSON.stringify(body) === JSON.stringify(expectedPostBody))
        .reply(201, () => {
          postCallCount++;

          return {};
        });

      // when
      await updateOrganizationsAndSendInvitations({ accessToken, data, organizationsByExternalId });

      // then
      expect(networkStub1.isDone()).to.be.true;
      expect(networkStub2.isDone()).to.be.true;
      expect(postCallCount).to.be.equal(1);
      expect(patchCallCount).to.be.equal(1);
    });
  });
});
