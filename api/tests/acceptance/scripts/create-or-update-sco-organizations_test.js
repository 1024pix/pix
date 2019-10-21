const { expect, nock } = require('../../test-helper');
const script = require('../../../scripts/create-or-update-sco-organizations');

describe('Acceptance | Scripts | create-or-update-sco-organizations.js', () => {

  describe('#assertFileValidity', () => {

    it('should throw an error when file does not exist', () => {
      // given
      const filePath = 'inexistant.file';

      try {
        // when
        script.assertFileValidity(filePath);

        // then
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        expect(err.message).to.equal('File not found inexistant.file');
      }
    });

    it('should throw an error when file extension is not ".csv"', () => {
      // given
      const filePath = `${__dirname}/file_with_bad_extension.html`;

      try {
        // when
        script.assertFileValidity(filePath);

        // then
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        expect(err.message).to.equal('File extension not supported .html');
      }
    });

  });

  describe('#organizeOrganizationsByExternalId', () => {

    it('should return organizations data by externalId', () => {
      // given
      const data = [
        {
          id: 1,
          attributes: {
            name: 'Lycée Jean Moulin',
            'external-id': 'A100',
          },
        },
        {
          id: 2,
          attributes: {
            name: 'Lycée Jean Guedin',
            'external-id': 'B200',
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
      const result = script.organizeOrganizationsByExternalId(data);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#createOrUpdateOrganizations', () => {

    it('should create or update organizations', async () => {
      // given
      const organizationsByExternalId = {
        A100: {
          id: 1,
          name: 'Lycée Jean Moulin',
          'external-id': 'A10',
        },
        B200: {
          id: 2,
          name: 'Lycée Jean Guedin',
          'external-id': 'B20',
        },
      };

      const data = [
        ['A100', 'Lycée Jean Moulin'], // untouched
        ['B200', 'Lycée Technique Jean Guedin'], // updated
        ['C300', 'Lycée Professionnel Jean Rémy'], // created
      ];

      const expectedPatchBody = {
        data: {
          type: 'organizations',
          id: 2,
          attributes: {
            name: 'Lycée Technique Jean Guedin',
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
            'is-managing-students': false,
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
      await script.createOrUpdateOrganizations('token', organizationsByExternalId, data);

      // then
      expect(networkStub1.isDone()).to.be.true;
      expect(networkStub2.isDone()).to.be.true;
      expect(postCallCount).to.be.equal(1);
      expect(patchCallCount).to.be.equal(1);
    });
  });

});
