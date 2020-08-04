const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');
const Membership = require('../../../lib/domain/models/Membership');

describe('Acceptance | Controller | Schooling-registration-user-associations', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/schooling-registration-user-associations/', () => {
    let organization;
    let campaign;
    let options;
    let schoolingRegistration;
    let user;

    beforeEach(async () => {
      // given
      options = {
        method: 'POST',
        url: '/api/schooling-registration-user-associations/',
        headers: {},
        payload: {}
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      await databaseBuilder.commit();
    });

    it('should return an 200 status after having successfully associated user to schoolingRegistration', async () => {
      // given
      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'campaign-code': campaign.code,
          'first-name': schoolingRegistration.firstName,
          'last-name': schoolingRegistration.lastName,
          'birthdate': schoolingRegistration.birthdate
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('When student is already reconciled in the same organization', () => {

      it('should return a schooling registration already linked error (short code R31 when account with email)', async () => {
        // given
        const userWithEmailOnly = databaseBuilder.factory.buildUser();
        userWithEmailOnly.username = null;
        userWithEmailOnly.email = 'john.harry@example.net';
        userWithEmailOnly.samlId = null;
        const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
        schoolingRegistration.userId = userWithEmailOnly.id;
        await databaseBuilder.commit();

        const expectedResponse = {
          status: '409',
          code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
          title: 'Conflict',
          detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
          meta: { shortCode: 'R31', value: 'j***@example.net' }
        };

        options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'first-name': schoolingRegistration.firstName,
            'last-name': schoolingRegistration.lastName,
            'birthdate': schoolingRegistration.birthdate
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0]).to.deep.equal(expectedResponse);
      });

      it('should return a schooling registration already linked error (short code R32 when connected with username)', async () => {
        // given
        const userWithUsernameOnly = databaseBuilder.factory.buildUser();
        userWithUsernameOnly.username = 'john.harry0702';
        userWithUsernameOnly.email = null;
        userWithUsernameOnly.samlId = null;
        const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
        schoolingRegistration.userId = userWithUsernameOnly.id;
        await databaseBuilder.commit();

        const expectedResponse = {
          status: '409',
          code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
          title: 'Conflict',
          detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
          meta: { shortCode: 'R32', value: 'j***.h***2' }
        };

        options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'first-name': schoolingRegistration.firstName,
            'last-name': schoolingRegistration.lastName,
            'birthdate': schoolingRegistration.birthdate
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0]).to.deep.equal(expectedResponse);
      });

      it('should return a schooling registration already linked error (short code R33 when account with samlId)', async () => {
        // given
        const userWithEmailOnly = databaseBuilder.factory.buildUser();
        userWithEmailOnly.username = null;
        userWithEmailOnly.email = null;
        userWithEmailOnly.samlId = '12345689';
        const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
        schoolingRegistration.userId = userWithEmailOnly.id;
        await databaseBuilder.commit();

        const expectedResponse = {
          status: '409',
          code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
          title: 'Conflict',
          detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
          meta: { shortCode: 'R33', value: null }
        };

        options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'first-name': schoolingRegistration.firstName,
            'last-name': schoolingRegistration.lastName,
            'birthdate': schoolingRegistration.birthdate
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0]).to.deep.equal(expectedResponse);
      });
    });

    context('When student is already reconciled in another organization', () => {

      it('should return a schooling registration already linked error (short code R11 when account with email)', async () => {
        // given
        const userWithEmailOnly = databaseBuilder.factory.buildUser();
        userWithEmailOnly.username = null;
        userWithEmailOnly.email = 'john.harry@example.net';
        userWithEmailOnly.samlId = null;

        const otherSchoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration();
        otherSchoolingRegistration.nationalStudentId = schoolingRegistration.nationalStudentId;
        otherSchoolingRegistration.birthdate = schoolingRegistration.birthdate;
        otherSchoolingRegistration.firstName = schoolingRegistration.firstName;
        otherSchoolingRegistration.lastName = schoolingRegistration.lastName;
        otherSchoolingRegistration.userId = userWithEmailOnly.id;

        await databaseBuilder.commit();

        const expectedResponse = {
          status: '409',
          code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
          title: 'Conflict',
          detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
          meta: { shortCode: 'R11', value: 'j***@example.net' }
        };

        options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'first-name': schoolingRegistration.firstName,
            'last-name': schoolingRegistration.lastName,
            'birthdate': schoolingRegistration.birthdate
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0]).to.deep.equal(expectedResponse);
      });

      it('should return a schooling registration already linked error (short code R12 when connected with username)', async () => {
        // given
        const userWithUsernameOnly = databaseBuilder.factory.buildUser();
        userWithUsernameOnly.email = null;
        userWithUsernameOnly.username = 'john.harry0702';
        userWithUsernameOnly.samlId = null;

        const otherSchoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration();
        otherSchoolingRegistration.nationalStudentId = schoolingRegistration.nationalStudentId;
        otherSchoolingRegistration.birthdate = schoolingRegistration.birthdate;
        otherSchoolingRegistration.firstName = schoolingRegistration.firstName;
        otherSchoolingRegistration.lastName = schoolingRegistration.lastName;
        otherSchoolingRegistration.userId = userWithUsernameOnly.id;
        await databaseBuilder.commit();

        const expectedResponse = {
          status: '409',
          code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
          title: 'Conflict',
          detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
          meta: { shortCode: 'R12', value: 'j***.h***2' }
        };

        options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'first-name': schoolingRegistration.firstName,
            'last-name': schoolingRegistration.lastName,
            'birthdate': schoolingRegistration.birthdate
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0]).to.deep.equal(expectedResponse);
      });

      it('should return a schooling registration already linked error (short code R13 when account with samlId)', async () => {
        // given
        const userWithSamlIdOnly = databaseBuilder.factory.buildUser();
        userWithSamlIdOnly.email = null;
        userWithSamlIdOnly.username = null;
        userWithSamlIdOnly.samlId = '12345678';

        const otherSchoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration();
        otherSchoolingRegistration.nationalStudentId = schoolingRegistration.nationalStudentId;
        otherSchoolingRegistration.birthdate = schoolingRegistration.birthdate;
        otherSchoolingRegistration.firstName = schoolingRegistration.firstName;
        otherSchoolingRegistration.lastName = schoolingRegistration.lastName;
        otherSchoolingRegistration.userId = userWithSamlIdOnly.id;
        await databaseBuilder.commit();

        const expectedResponse = {
          status: '409',
          code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
          title: 'Conflict',
          detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
          meta: { shortCode: 'R13', value: null }
        };

        options.headers.authorization = generateValidRequestAuthorizationHeader(userWithSamlIdOnly.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'first-name': schoolingRegistration.firstName,
            'last-name': schoolingRegistration.lastName,
            'birthdate': schoolingRegistration.birthdate
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0]).to.deep.equal(expectedResponse);
      });
    });

    context('when no schoolingRegistration can be associated because birthdate does not match', () => {

      it('should return an 404 NotFoundError error', async () => {
        // given
        const options = {
          method: 'POST',
          url: '/api/schooling-registration-user-associations/',
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              attributes: {
                'campaign-code': campaign.code,
                'first-name': schoolingRegistration.firstName,
                'last-name': schoolingRegistration.lastName,
                'birthdate': '1990-03-01'
              }
            }
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.result.errors[0].detail).to.equal('There were no schoolingRegistrations matching with organization and birthdate');
      });
    });

    context('when no schoolingRegistration found to associate because names does not match', () => {

      it('should return an 404 NotFoundError error', async () => {
        // given
        const options = {
          method: 'POST',
          url: '/api/schooling-registration-user-associations/',
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              attributes: {
                'campaign-code': campaign.code,
                'first-name': 'wrong firstName',
                'last-name': 'wrong lastName',
                'birthdate': schoolingRegistration.birthdate
              }
            }
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.result.errors[0].detail).to.equal('There were no schoolingRegistrations matching with names');
      });
    });

    context('when user is not authenticated', () => {

      it('should respond with a 401 - unauthorized access', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when a field is not valid', () => {

      it('should respond with a 422 - Unprocessable Entity', async () => {
        // given
        const options = {
          method: 'POST',
          url: '/api/schooling-registration-user-associations/',
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              attributes: {
                'campaign-code': campaign.code,
                'first-name': ' ',
                'last-name': schoolingRegistration.lastName,
                'birthdate': schoolingRegistration.birthdate
              }
            }
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });

  describe('POST /api/schooling-registration-user-associations/auto', () => {
    const nationalStudentId = '12345678AZ';
    let organization;
    let campaign;
    let options;
    let user;

    beforeEach(async () => {
      // given
      options = {
        method: 'POST',
        url: '/api/schooling-registration-user-associations/auto',
        headers: {},
        payload: {}
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null, nationalStudentId });

      await databaseBuilder.commit();
    });

    it('should return an 200 status after having successfully associated user to schoolingRegistration', async () => {
      // given
      databaseBuilder.factory.buildSchoolingRegistration({ userId: user.id, nationalStudentId });
      await databaseBuilder.commit();

      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'campaign-code': campaign.code,
        },
        type: 'schooling-registration-user-associations'
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when user is not authenticated', () => {

      it('should respond with a 401 - unauthorized access', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when user could not be reconciled', () => {

      it('should respond with a 422 - unprocessable entity', async () => {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });

  describe('GET /api/schooling-registration-user-associations/', () => {
    let options;
    let server;
    let user;
    let organization;
    let schoolingRegistration;
    let campaignCode;

    beforeEach(async () => {
      server = await createServer();

      organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId: organization.id }).code;
      user = databaseBuilder.factory.buildUser();
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: user.id });
      await databaseBuilder.commit();
      options = {
        method: 'GET',
        url: `/api/schooling-registration-user-associations/?userId=${user.id}&campaignCode=${campaignCode}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async () => {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', () => {

      it('should return the schoolingRegistration linked to the user and a 200 status code response', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['first-name']).to.deep.equal(schoolingRegistration.firstName);
        expect(response.result.data.attributes['last-name']).to.deep.equal(schoolingRegistration.lastName);
        expect(response.result.data.attributes['birthdate']).to.deep.equal(schoolingRegistration.birthdate);
      });
    });

    describe('There is no schoolingRegistration linked to the user', () => {

      it('should return a data null', async () => {
        // given
        const userWithoutStudent = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/schooling-registration-user-associations/?userId=${userWithoutStudent.id}&campaignCode=${campaignCode}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userWithoutStudent.id) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data).to.equal(null);
      });
    });

    describe('There is no schoolingRegistration linked to the organization owning the campaign', () => {

      it('should return a data null', async () => {
        // given
        const otherCampaignCode = databaseBuilder.factory.buildCampaign().code;
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/schooling-registration-user-associations/?userId=${user.id}&campaignCode=${otherCampaignCode}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data).to.equal(null);
      });
    });
  });

  describe('PUT /api/schooling-registration-user-associations/possibilities', () => {
    let options;
    let server;
    let user;
    let organization;
    let schoolingRegistration;
    let campaignCode;

    beforeEach(async () => {
      server = await createServer();

      organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId: organization.id }).code;
      user = databaseBuilder.factory.buildUser();
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, firstName: user.firstName, lastName: user.lastName, userId: null });
      await databaseBuilder.commit();
      options = {
        method: 'PUT',
        url: '/api/schooling-registration-user-associations/possibilities',
        headers: {},
        payload: {
          data: {
            attributes: {
              'campaign-code': campaignCode,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              birthdate: schoolingRegistration.birthdate
            }
          }
        }
      };
    });

    describe('Success case', () => {

      it('should return the schoolingRegistration linked to the user and a 200 status code response', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    describe('Error cases', () => {

      context('when no schoolingRegistration can be associated because birthdate does not match', () => {

        it('should respond with a 404 - Not Found', async () => {
          // given
          options.payload.data.attributes.birthdate = '1990-03-01';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('There were no schoolingRegistrations matching with organization and birthdate');
        });
      });

      context('when no schoolingRegistration found to associate because names does not match', () => {

        it('should respond with a 404 - Not Found', async () => {
          // given
          options.payload.data.attributes['first-name'] = 'wrong firstName';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('There were no schoolingRegistrations matching with names');
        });
      });

      context('when schoolingRegistration is already associated in the same organization', () => {

        it('should respond with a 409 - Conflict', async () => {
          // given
          const schoolingRegistrationAlreadyMatched = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, firstName: user.firstName, lastName: user.lastName, userId: user.id });
          await databaseBuilder.commit();
          options.payload.data.attributes['first-name'] = schoolingRegistrationAlreadyMatched.firstName;
          options.payload.data.attributes['last-name'] = schoolingRegistrationAlreadyMatched.lastName;
          options.payload.data.attributes.birthdate = schoolingRegistrationAlreadyMatched.birthdate;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0].detail).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
        });
      });

      context('when a field is not valid', () => {

        it('should respond with a 422 - Unprocessable Entity', async () => {
          // given
          options.payload.data.attributes['last-name'] = ' ';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });
    });
  });

  describe('DELETE /api/schooling-registration-user-associations/', () => {
    it('should return an 204 status after having successfully dissociated user from schoolingRegistration', async () => {
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id, organizationRole: Membership.roles.ADMIN });
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id });

      const authorizationToken = generateValidRequestAuthorizationHeader(user.id);

      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: '/api/schooling-registration-user-associations/',
        headers: {
          authorization: authorizationToken
        },
        payload: {
          data: {
            attributes: {
              'schooling-registration-id': schoolingRegistration.id
            }
          }
        }
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(204);
    });

    it('should return an 403 status when user is not admin of the organization', async () => {
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id, organizationRole: Membership.roles.MEMBER });
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id });

      const authorizationToken = generateValidRequestAuthorizationHeader(user.id);

      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: '/api/schooling-registration-user-associations/',
        headers: {
          authorization: authorizationToken
        },
        payload: {
          data: {
            attributes: {
              'schooling-registration-id': schoolingRegistration.id
            }
          }
        }
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(403);
    });
  });
});
