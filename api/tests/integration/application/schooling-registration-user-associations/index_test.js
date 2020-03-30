const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const schoolingRegistrationUserAssociationController = require('../../../../lib/application/schooling-registration-user-associations/schooling-registration-user-association-controller');
const moduleUnderTest = require('../../../../lib/application/schooling-registration-user-associations');

describe('Integration | Application | Route | schooling-registration-user-associations', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(schoolingRegistrationUserAssociationController, 'associate').callsFake((request, h) => h.response('ok').code(204));
    sinon.stub(schoolingRegistrationUserAssociationController, 'findAssociation').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(schoolingRegistrationUserAssociationController, 'generateUsername').callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/schooling-registration-user-associations', () => {

    const method = 'POST';
    const url = '/api/schooling-registration-user-associations';

    it('should succeed', async () => {
      // given
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            'campaign-code': 'RESTRICTD'
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should succeed when there is a space', async () => {
      // given
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert ',
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
      expect(response.request.payload.data.attributes['first-name']).to.equal('Robert ');
    });

    it('should return an error when there is no payload', async () => {
      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid first name attribute in the payload', async () => {
      // given
      const INVALID_FIRSTNAME = ' ';
      const payload = {
        data: {
          attributes: {
            'first-name': INVALID_FIRSTNAME,
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid last name attribute in the payload', async () => {
      // given
      const INVALID_LASTNAME = '';
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': INVALID_LASTNAME,
            birthdate: '2012-12-12',
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid a birthdate attribute (with space) in the payload', async () => {
      // given
      const INVALID_BIRTHDATE = '2012- 12-12';

      // when
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: INVALID_BIRTHDATE,
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid birthdate attribute (with extra zeros) in the payload', async () => {
      // given
      const INVALID_BIRTHDATE = '2012-012-12';
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: INVALID_BIRTHDATE,
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid birthdate attribute (not a proper date) in the payload', async () => {
      // given
      const INVALID_BIRTHDATE = '1999-99-99';
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: INVALID_BIRTHDATE,
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid campaign code attribute in the payload', async () => {
      // given
      const INVALID_CAMPAIGNCODE = '';
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            'campaign-code': INVALID_CAMPAIGNCODE,
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });
  });

  describe('GET /api/schooling-registration-user-associations', () => {

    const method = 'GET';
    const url = '/api/schooling-registration-user-associations';

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PUT /api/schooling-registration-user-associations/possibilities', () => {

    const method = 'PUT';
    const url = '/api/schooling-registration-user-associations/possibilities';

    it('should exist', async () => {
      // given
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should succeed when there is a space', async () => {
      // given
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert ',
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.request.payload.data.attributes['first-name']).to.equal('Robert ');
    });

    it('should return an error when there is no payload', async () => {
      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid first name attribute in the payload', async () => {
      // given
      const INVALID_FIRSTNAME = ' ';
      const payload = {
        data: {
          attributes: {
            'first-name': INVALID_FIRSTNAME,
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid last name attribute in the payload', async () => {
      // given
      const INVALID_LASTNAME = '';
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': INVALID_LASTNAME,
            birthdate: '2012-12-12',
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid a birthdate attribute (with space) in the payload', async () => {
      // given
      const INVALID_BIRTHDATE = '2012- 12-12';
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: INVALID_BIRTHDATE,
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid birthdate attribute (with extra zeros) in the payload', async () => {
      // given
      const INVALID_BIRTHDATE = '2012-012-12';

      // when
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: INVALID_BIRTHDATE,
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid birthdate attribute (not a proper date) in the payload', async () => {
      // given
      const INVALID_BIRTHDATE = '1999-99-99';
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: INVALID_BIRTHDATE,
            'campaign-code': 'RESTRICTD',
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid campaign code attribute in the payload', async () => {
      // given
      const INVALID_CAMPAIGNCODE = '';
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            'campaign-code': INVALID_CAMPAIGNCODE,
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });
  });
});
