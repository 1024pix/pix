const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const supOrganizationLearnerController = require('../../../../lib/application/sup-organization-learners/sup-organization-learner-controller');
const moduleUnderTest = require('../../../../lib/application/sup-organization-learners');

describe('Integration | Application | Route | sup-organization-learners', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(supOrganizationLearnerController, 'reconcileSupOrganizationLearner')
      .callsFake((request, h) => h.response('ok').code(204));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/schooling-registration-user-associations/student', function () {
    const method = 'POST';
    const url = '/api/schooling-registration-user-associations/student';

    context('User association with studentNumber, firstName, lastName, birthdate and campaignCode', function () {
      it('should succeed', async function () {
        // given
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should succeed when there is a space', async function () {
        // given
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001 ',
              'first-name': 'Robert ',
              'last-name': 'Smith ',
              birthdate: '2012-12-12',
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
        expect(response.request.payload.data.attributes['first-name']).to.equal('Robert ');
      });

      it('should return an error when there is no payload', async function () {
        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid student number attribute in the payload', async function () {
        // given
        const INVALID_STUDENT_NUMBER = ' ';
        const payload = {
          data: {
            attributes: {
              'student-number': INVALID_STUDENT_NUMBER,
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid first name attribute in the payload', async function () {
        // given
        const INVALID_FIRSTNAME = ' ';
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': INVALID_FIRSTNAME,
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid last name attribute in the payload', async function () {
        // given
        const INVALID_LASTNAME = '';
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': INVALID_LASTNAME,
              birthdate: '2012-12-12',
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid a birthdate attribute (with space) in the payload', async function () {
        // given
        const INVALID_BIRTHDATE = '2012- 12-12';

        // when
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: INVALID_BIRTHDATE,
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid birthdate attribute (with extra zeros) in the payload', async function () {
        // given
        const INVALID_BIRTHDATE = '2012-012-12';
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: INVALID_BIRTHDATE,
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid birthdate attribute (not a proper date) in the payload', async function () {
        // given
        const INVALID_BIRTHDATE = '1999-99-99';
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: INVALID_BIRTHDATE,
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid campaign code attribute in the payload', async function () {
        // given
        const INVALID_CAMPAIGNCODE = '';
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'campaign-code': INVALID_CAMPAIGNCODE,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });

  describe('POST /api/sup-organization-learners/association', function () {
    const method = 'POST';
    const url = '/api/sup-organization-learners/association';

    context('User association with studentNumber, firstName, lastName, birthdate and campaignCode', function () {
      it('should succeed', async function () {
        // given
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should succeed when there is a space', async function () {
        // given
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001 ',
              'first-name': 'Robert ',
              'last-name': 'Smith ',
              birthdate: '2012-12-12',
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
        expect(response.request.payload.data.attributes['first-name']).to.equal('Robert ');
      });

      it('should return an error when there is no payload', async function () {
        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid student number attribute in the payload', async function () {
        // given
        const INVALID_STUDENT_NUMBER = ' ';
        const payload = {
          data: {
            attributes: {
              'student-number': INVALID_STUDENT_NUMBER,
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid first name attribute in the payload', async function () {
        // given
        const INVALID_FIRSTNAME = ' ';
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': INVALID_FIRSTNAME,
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid last name attribute in the payload', async function () {
        // given
        const INVALID_LASTNAME = '';
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': INVALID_LASTNAME,
              birthdate: '2012-12-12',
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid a birthdate attribute (with space) in the payload', async function () {
        // given
        const INVALID_BIRTHDATE = '2012- 12-12';

        // when
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: INVALID_BIRTHDATE,
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid birthdate attribute (with extra zeros) in the payload', async function () {
        // given
        const INVALID_BIRTHDATE = '2012-012-12';
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: INVALID_BIRTHDATE,
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid birthdate attribute (not a proper date) in the payload', async function () {
        // given
        const INVALID_BIRTHDATE = '1999-99-99';
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: INVALID_BIRTHDATE,
              'campaign-code': 'RESTRICTD',
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid campaign code attribute in the payload', async function () {
        // given
        const INVALID_CAMPAIGNCODE = '';
        const payload = {
          data: {
            attributes: {
              'student-number': 'F001',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              'campaign-code': INVALID_CAMPAIGNCODE,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });
});
