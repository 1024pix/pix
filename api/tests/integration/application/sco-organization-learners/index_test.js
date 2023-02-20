import { expect, sinon, HttpTestServer } from '../../../test-helper';
import scoOrganizationLearnerController from '../../../../lib/application/sco-organization-learners/sco-organization-learner-controller';
import moduleUnderTest from '../../../../lib/application/sco-organization-learners';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';

describe('Integration | Application | Route | sco-organization-learners', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(scoOrganizationLearnerController, 'reconcileScoOrganizationLearnerManually')
      .callsFake((request, h) => h.response('ok').code(204));
    sinon
      .stub(scoOrganizationLearnerController, 'reconcileScoOrganizationLearnerAutomatically')
      .callsFake((request, h) => h.response('ok').code(204));
    sinon
      .stub(scoOrganizationLearnerController, 'generateUsername')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(scoOrganizationLearnerController, 'createAndReconcileUserToOrganizationLearner')
      .callsFake((request, h) => h.response().code(204));
    sinon
      .stub(scoOrganizationLearnerController, 'createUserAndReconcileToOrganizationLearnerFromExternalUser')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents')
      .callsFake((request, h) => h.response(true));
    sinon
      .stub(scoOrganizationLearnerController, 'updatePassword')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(scoOrganizationLearnerController, 'generateUsernameWithTemporaryPassword')
      .callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/sco-organization-learners/association', function () {
    const method = 'POST';
    const url = '/api/sco-organization-learners/association';

    context('User association with firstName, lastName, birthdate and campaignCode', function () {
      it('should succeed', async function () {
        // given
        const payload = {
          data: {
            attributes: {
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
              'first-name': 'Robert ',
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
        expect(response.request.payload.data.attributes['first-name']).to.equal('Robert ');
      });

      it('should return an error when there is no payload', async function () {
        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should return an error when there is an invalid first name attribute in the payload', async function () {
        // given
        const INVALID_FIRSTNAME = ' ';
        const payload = {
          data: {
            attributes: {
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

  describe('POST /api/sco-organization-learners/association/auto', function () {
    const method = 'POST';
    const url = '/api/sco-organization-learners/association/auto';

    it('should succeed', async function () {
      // given
      const payload = {
        data: {
          attributes: {
            'campaign-code': 'RESTRICTD',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return an error when there is an invalid campaign code attribute in the payload', async function () {
      // given
      const INVALID_CAMPAIGNCODE = '';
      const payload = {
        data: {
          attributes: {
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

  describe('PUT /api/sco-organization-learners/possibilities', function () {
    const method = 'PUT';
    const url = '/api/sco-organization-learners/possibilities';

    it('should exist', async function () {
      // given
      const payload = {
        data: {
          attributes: {
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
      expect(response.statusCode).to.equal(200);
    });

    it('should succeed when there is a space', async function () {
      // given
      const payload = {
        data: {
          attributes: {
            'first-name': 'Robert ',
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            'campaign-code': 'RESTRICTD',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.request.payload.data.attributes['first-name']).to.equal('Robert ');
    });

    it('should return an error when there is no payload', async function () {
      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return an error when there is an invalid first name attribute in the payload', async function () {
      // given
      const INVALID_FIRSTNAME = ' ';
      const payload = {
        data: {
          attributes: {
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
      const payload = {
        data: {
          attributes: {
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

      // when
      const payload = {
        data: {
          attributes: {
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

  describe('POST /api/sco-organization-learners/dependent', function () {
    let method;
    let url;
    let payload;
    let response;

    context('When registration succeed with email', function () {
      beforeEach(async function () {
        // given
        method = 'POST';
        url = '/api/sco-organization-learners/dependent';
        payload = {
          data: {
            attributes: {
              'campaign-code': 'RESTRICTD',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              email: 'robert.smith@example.net',
              password: 'P@ssw0rd',
              'with-username': false,
              username: null,
            },
          },
        };
      });

      it('should return 204', async function () {
        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('When registration succeed with username', function () {
      beforeEach(async function () {
        // given
        method = 'POST';
        url = '/api/sco-organization-learners/dependent';
        payload = {
          data: {
            attributes: {
              'campaign-code': 'RESTRICTD',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              username: 'robert.smith1212',
              password: 'P@ssw0rd',
              'with-username': true,
              email: null,
            },
          },
        };
      });

      it('should return 204', async function () {
        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('Error cases', function () {
      beforeEach(async function () {
        // given
        method = 'POST';
        url = '/api/sco-organization-learners/dependent';
        payload = {
          data: {
            attributes: {
              'campaign-code': 'RESTRICTD',
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              username: 'robert.smith1212',
              password: 'P@ssw0rd',
              'with-username': true,
            },
          },
        };
      });

      it('should return 400 when firstName is empty', async function () {
        // given
        payload.data.attributes['first-name'] = '';

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when lastName is empty', async function () {
        // given
        payload.data.attributes['last-name'] = '';

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when birthDate is not a valid date', async function () {
        // given
        payload.data.attributes.birthdate = '2012*-12-12';

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when campaignCode is empty', async function () {
        // given
        payload.data.attributes['campaign-code'] = '';

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when password is not valid', async function () {
        // given
        payload.data.attributes.password = 'not_valid';

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when withUsername is not a boolean', async function () {
        // given
        payload.data.attributes['with-username'] = 'not_a_boolean';

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      context('when username is not valid', function () {
        it('should return 400 when username is an email', async function () {
          // given
          payload.data.attributes.username = 'robert.smith1212@example.net';

          // when
          response = await httpTestServer.request(method, url, payload);

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return 400 when username has not dot between names', async function () {
          // given
          payload.data.attributes.username = 'robertsmith1212';

          // when
          response = await httpTestServer.request(method, url, payload);

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return 400 when username does not end with 4 digits', async function () {
          // given
          payload.data.attributes.username = 'robert.smith';

          // when
          response = await httpTestServer.request(method, url, payload);

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return 400 when username is capitalized', async function () {
          // given
          payload.data.attributes.username = 'Robert.Smith1212';

          // when
          response = await httpTestServer.request(method, url, payload);
          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return 400 when username is a phone number', async function () {
          // given
          payload.data.attributes.username = '0601010101';

          // when
          response = await httpTestServer.request(method, url, payload);
          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('POST /api/sco-organization-learners/external', function () {
    let method;
    let url;
    let payload;
    let response;

    beforeEach(async function () {
      // given
      method = 'POST';
      url = '/api/sco-organization-learners/external';
      payload = {
        data: {
          attributes: {
            'campaign-code': 'RESTRICTD',
            'external-user-token': 'external-user-token',
            birthdate: '1948-12-21',
            'access-token': null,
          },
          type: 'external-users',
        },
      };
    });

    it('should succeed', async function () {
      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 400 Bad Request when campaignCode is missing', async function () {
      // given
      payload.data.attributes['campaign-code'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal(
        '"data.attributes.campaign-code" is not allowed to be empty'
      );
    });

    it('should return 400 Bad Request when external-user-token is missing', async function () {
      // given
      payload.data.attributes['external-user-token'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal(
        '"data.attributes.external-user-token" is not allowed to be empty'
      );
    });

    it('should return 400 Bad Request when birthDate is not a valid date', async function () {
      // given
      payload.data.attributes.birthdate = '2012*-12-12';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal(
        '"data.attributes.birthdate" must be in YYYY-MM-DD format'
      );
    });
  });

  describe('POST /api/sco-organization-learners/password-update', function () {
    it('should succeed', async function () {
      // given
      const method = 'POST';
      const url = '/api/sco-organization-learners/password-update';
      const payload = {
        data: {
          attributes: {
            'organization-learner-id': 1,
            'organization-id': 3,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sco-organization-learners/username-password-generation', function () {
    it('should succeed', async function () {
      // given
      const method = 'POST';
      const url = '/api/sco-organization-learners/username-password-generation';
      const payload = {
        data: {
          attributes: {
            'organization-learner-id': 1,
            'organization-id': 3,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
