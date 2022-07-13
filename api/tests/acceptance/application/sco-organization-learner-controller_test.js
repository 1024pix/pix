const { databaseBuilder, expect, generateValidRequestAuthorizationHeader, knex } = require('../../test-helper');

const createServer = require('../../../server');

describe('Acceptance | Controller | sco-organization-learners', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/schooling-registration-user-associations/', function () {
    let organization;
    let campaign;
    let options;
    let organizationLearner;
    let user;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/schooling-registration-user-associations',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'france',
        lastName: 'gall',
        birthdate: '2001-01-01',
        organizationId: organization.id,
        userId: null,
        nationalStudentId: 'francegall123',
      });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      await databaseBuilder.commit();
    });

    context('associate user with firstName, lastName and birthdate', function () {
      it('should return an 200 status after having successfully associated user to organizationLearner', async function () {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'first-name': organizationLearner.firstName,
            'last-name': organizationLearner.lastName,
            birthdate: organizationLearner.birthdate,
          },
        };
        options.url += '?withReconciliation=true';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      context('When student is already reconciled in the same organization', function () {
        it('should return an organization learner already linked error (short code R31 when account with email)', async function () {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: 'john.harry@example.net',
          });
          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            userId: null,
          });
          organizationLearner.userId = userWithEmailOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R31', value: 'j***@example.net', userId: userWithEmailOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return an organization learner already linked error (short code R32 when connected with username)', async function () {
          // given
          const userWithUsernameOnly = databaseBuilder.factory.buildUser({
            username: 'john.harry0702',
            email: null,
          });
          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            userId: null,
          });
          organizationLearner.userId = userWithUsernameOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R32', value: 'j***.h***2', userId: userWithUsernameOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return an organization learner already linked error (short code R33 when account with samlId)', async function () {
          // given
          const userWithSamlOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: null,
          });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: '12345678',
            userId: userWithSamlOnly.id,
          });

          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            userId: null,
          });
          organizationLearner.userId = userWithSamlOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R33', value: null, userId: userWithSamlOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithSamlOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });
      });

      context('When student is already reconciled in another organization', function () {
        it('should return an organization learner already linked error (short code R13 when account with samlId)', async function () {
          // given
          const userWithSamlIdOnly = databaseBuilder.factory.buildUser({
            email: null,
            username: null,
          });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: '12345678',
            userId: userWithSamlIdOnly.id,
          });

          const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner();
          otherOrganizationLearner.nationalStudentId = organizationLearner.nationalStudentId;
          otherOrganizationLearner.birthdate = organizationLearner.birthdate;
          otherOrganizationLearner.firstName = organizationLearner.firstName;
          otherOrganizationLearner.lastName = organizationLearner.lastName;
          otherOrganizationLearner.userId = userWithSamlIdOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R13', value: null, userId: userWithSamlIdOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithSamlIdOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return an organization learner already linked error (short code R11 when account with email)', async function () {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: 'john.harry@example.net',
          });
          const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner();
          otherOrganizationLearner.nationalStudentId = organizationLearner.nationalStudentId;
          otherOrganizationLearner.birthdate = organizationLearner.birthdate;
          otherOrganizationLearner.firstName = organizationLearner.firstName;
          otherOrganizationLearner.lastName = organizationLearner.lastName;
          otherOrganizationLearner.userId = userWithEmailOnly.id;

          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R11', value: 'j***@example.net', userId: userWithEmailOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return an organization learner already linked error (short code R12 when connected with username)', async function () {
          // given
          const userWithUsernameOnly = databaseBuilder.factory.buildUser({
            email: null,
            username: 'john.harry0702',
          });

          const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner();
          otherOrganizationLearner.nationalStudentId = organizationLearner.nationalStudentId;
          otherOrganizationLearner.birthdate = organizationLearner.birthdate;
          otherOrganizationLearner.firstName = organizationLearner.firstName;
          otherOrganizationLearner.lastName = organizationLearner.lastName;
          otherOrganizationLearner.userId = userWithUsernameOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R12', value: 'j***.h***2', userId: userWithUsernameOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });
      });

      context('when no organizationLearner can be associated because birthdate does not match', function () {
        it('should return an 404 NotFoundError error', async function () {
          // given
          const options = {
            method: 'POST',
            url: '/api/schooling-registration-user-associations/',
            headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
            payload: {
              data: {
                attributes: {
                  'campaign-code': campaign.code,
                  'first-name': organizationLearner.firstName,
                  'last-name': organizationLearner.lastName,
                  birthdate: '1990-03-01',
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('There are no organization learners found');
        });
      });

      context('when no organizationLearner found to associate because names does not match', function () {
        it('should return an 404 NotFoundError error', async function () {
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
                  birthdate: organizationLearner.birthdate,
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('There were no organizationLearners matching with names');
        });
      });

      context('when user is not authenticated', function () {
        it('should respond with a 401 - unauthorized access', async function () {
          // given
          options.headers.authorization = 'invalid.access.token';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });

      context('when a field is not valid', function () {
        it('should respond with a 422 - Unprocessable Entity', async function () {
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
                  'last-name': organizationLearner.lastName,
                  birthdate: organizationLearner.birthdate,
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });

      context('When withReconciliation query param is set to false', function () {
        it('should not reconcile user and return a 204 No Content', async function () {
          // given
          options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };
          options.url += '?withReconciliation=false';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
          const organizationLearnerInDB = await knex('organization-learners')
            .where({
              firstName: organizationLearner.firstName,
              lastName: organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            })
            .select();
          expect(organizationLearnerInDB.userId).to.be.undefined;
        });

        context('When student is trying to be reconciled on another account', function () {
          it('should return a 422 error (short code R90 when student id and birthdate are different)', async function () {
            // given
            const sisterSchool = databaseBuilder.factory.buildOrganization({ id: 7, type: 'SCO' });
            const brotherSchool = databaseBuilder.factory.buildOrganization({ id: 666, type: 'SCO' });
            const littleBrotherCampaign = databaseBuilder.factory.buildCampaign({
              organizationId: brotherSchool.id,
              code: 'BROTHER',
            });

            const bigSisterAccount = databaseBuilder.factory.buildUser({
              firstName: 'Emmy',
              lastName: 'Barbier',
              birthdate: '2008-02-01',
              email: 'emmy.barbier@example.net',
            });
            databaseBuilder.factory.buildOrganizationLearner({
              firstName: 'Emmy',
              lastName: 'Barbier',
              birthdate: '2008-02-01',
              organizationId: sisterSchool.id,
              nationalStudentId: 'BBCC',
              userId: bigSisterAccount.id,
            });

            const littleBrother = databaseBuilder.factory.buildOrganizationLearner({
              firstName: 'Nicolas',
              lastName: 'Barbier',
              birthdate: '2010-02-01',
              organizationId: brotherSchool.id,
              nationalStudentId: 'AABB',
              userId: null,
            });
            await databaseBuilder.commit();

            // when
            const response = await server.inject({
              method: 'POST',
              url: '/api/schooling-registration-user-associations?withReconciliation=false',
              headers: { authorization: generateValidRequestAuthorizationHeader(bigSisterAccount.id) },
              payload: {
                data: {
                  attributes: {
                    'campaign-code': littleBrotherCampaign.code,
                    'first-name': littleBrother.firstName,
                    'last-name': littleBrother.lastName,
                    birthdate: littleBrother.birthdate,
                  },
                },
              },
            });

            // then
            expect(response.statusCode).to.equal(422);
            expect(response.result.errors[0]).to.deep.equal({
              detail: "Cet utilisateur n'est pas autorisé à se réconcilier avec ce compte",
              code: 'ACCOUNT_SEEMS_TO_BELONGS_TO_ANOTHER_USER',
              meta: {
                shortCode: 'R90',
              },
              status: '422',
              title: 'Unprocessable entity',
            });
          });
        });
      });
    });
  });

  describe('POST /api/sco-organization-learners/association', function () {
    let organization;
    let campaign;
    let options;
    let organizationLearner;
    let user;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/sco-organization-learners/association',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'france',
        lastName: 'gall',
        birthdate: '2001-01-01',
        organizationId: organization.id,
        userId: null,
        nationalStudentId: 'francegall123',
      });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      await databaseBuilder.commit();
    });

    context('associate user with firstName, lastName and birthdate', function () {
      it('should return an 200 status after having successfully associated user to organizationLearner', async function () {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'first-name': organizationLearner.firstName,
            'last-name': organizationLearner.lastName,
            birthdate: organizationLearner.birthdate,
          },
        };
        options.url += '?withReconciliation=true';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      context('When student is already reconciled in the same organization', function () {
        it('should return an organization learner already linked error (short code R31 when account with email)', async function () {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: 'john.harry@example.net',
          });
          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            userId: null,
          });
          organizationLearner.userId = userWithEmailOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R31', value: 'j***@example.net', userId: userWithEmailOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return an organization learner already linked error (short code R32 when connected with username)', async function () {
          // given
          const userWithUsernameOnly = databaseBuilder.factory.buildUser({
            username: 'john.harry0702',
            email: null,
          });
          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            userId: null,
          });
          organizationLearner.userId = userWithUsernameOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R32', value: 'j***.h***2', userId: userWithUsernameOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return an organization learner already linked error (short code R33 when account with samlId)', async function () {
          // given
          const userWithSamlOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: null,
          });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: '12345678',
            userId: userWithSamlOnly.id,
          });

          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            userId: null,
          });
          organizationLearner.userId = userWithSamlOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R33', value: null, userId: userWithSamlOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithSamlOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });
      });

      context('When student is already reconciled in another organization', function () {
        it('should return an organization learner already linked error (short code R13 when account with samlId)', async function () {
          // given
          const userWithSamlIdOnly = databaseBuilder.factory.buildUser({
            email: null,
            username: null,
          });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: '12345678',
            userId: userWithSamlIdOnly.id,
          });

          const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner();
          otherOrganizationLearner.nationalStudentId = organizationLearner.nationalStudentId;
          otherOrganizationLearner.birthdate = organizationLearner.birthdate;
          otherOrganizationLearner.firstName = organizationLearner.firstName;
          otherOrganizationLearner.lastName = organizationLearner.lastName;
          otherOrganizationLearner.userId = userWithSamlIdOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R13', value: null, userId: userWithSamlIdOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithSamlIdOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return an organization learner already linked error (short code R11 when account with email)', async function () {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: 'john.harry@example.net',
          });
          const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner();
          otherOrganizationLearner.nationalStudentId = organizationLearner.nationalStudentId;
          otherOrganizationLearner.birthdate = organizationLearner.birthdate;
          otherOrganizationLearner.firstName = organizationLearner.firstName;
          otherOrganizationLearner.lastName = organizationLearner.lastName;
          otherOrganizationLearner.userId = userWithEmailOnly.id;

          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R11', value: 'j***@example.net', userId: userWithEmailOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return an organization learner already linked error (short code R12 when connected with username)', async function () {
          // given
          const userWithUsernameOnly = databaseBuilder.factory.buildUser({
            email: null,
            username: 'john.harry0702',
          });

          const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner();
          otherOrganizationLearner.nationalStudentId = organizationLearner.nationalStudentId;
          otherOrganizationLearner.birthdate = organizationLearner.birthdate;
          otherOrganizationLearner.firstName = organizationLearner.firstName;
          otherOrganizationLearner.lastName = organizationLearner.lastName;
          otherOrganizationLearner.userId = userWithUsernameOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R12', value: 'j***.h***2', userId: userWithUsernameOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });
      });

      context('when no organizationLearner can be associated because birthdate does not match', function () {
        it('should return an 404 NotFoundError error', async function () {
          // given
          const options = {
            method: 'POST',
            url: '/api/schooling-registration-user-associations/',
            headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
            payload: {
              data: {
                attributes: {
                  'campaign-code': campaign.code,
                  'first-name': organizationLearner.firstName,
                  'last-name': organizationLearner.lastName,
                  birthdate: '1990-03-01',
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('There are no organization learners found');
        });
      });

      context('when no organizationLearner found to associate because names does not match', function () {
        it('should return an 404 NotFoundError error', async function () {
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
                  birthdate: organizationLearner.birthdate,
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('There were no organizationLearners matching with names');
        });
      });

      context('when user is not authenticated', function () {
        it('should respond with a 401 - unauthorized access', async function () {
          // given
          options.headers.authorization = 'invalid.access.token';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });

      context('when a field is not valid', function () {
        it('should respond with a 422 - Unprocessable Entity', async function () {
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
                  'last-name': organizationLearner.lastName,
                  birthdate: organizationLearner.birthdate,
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });

      context('When withReconciliation query param is set to false', function () {
        it('should not reconcile user and return a 204 No Content', async function () {
          // given
          options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };
          options.url += '?withReconciliation=false';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
          const organizationLearnerInDB = await knex('organization-learners')
            .where({
              firstName: organizationLearner.firstName,
              lastName: organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            })
            .select();
          expect(organizationLearnerInDB.userId).to.be.undefined;
        });

        context('When student is trying to be reconciled on another account', function () {
          it('should return a 422 error (short code R90 when student id and birthdate are different)', async function () {
            // given
            const sisterSchool = databaseBuilder.factory.buildOrganization({ id: 7, type: 'SCO' });
            const brotherSchool = databaseBuilder.factory.buildOrganization({ id: 666, type: 'SCO' });
            const littleBrotherCampaign = databaseBuilder.factory.buildCampaign({
              organizationId: brotherSchool.id,
              code: 'BROTHER',
            });

            const bigSisterAccount = databaseBuilder.factory.buildUser({
              firstName: 'Emmy',
              lastName: 'Barbier',
              birthdate: '2008-02-01',
              email: 'emmy.barbier@example.net',
            });
            databaseBuilder.factory.buildOrganizationLearner({
              firstName: 'Emmy',
              lastName: 'Barbier',
              birthdate: '2008-02-01',
              organizationId: sisterSchool.id,
              nationalStudentId: 'BBCC',
              userId: bigSisterAccount.id,
            });

            const littleBrother = databaseBuilder.factory.buildOrganizationLearner({
              firstName: 'Nicolas',
              lastName: 'Barbier',
              birthdate: '2010-02-01',
              organizationId: brotherSchool.id,
              nationalStudentId: 'AABB',
              userId: null,
            });
            await databaseBuilder.commit();

            // when
            const response = await server.inject({
              method: 'POST',
              url: '/api/schooling-registration-user-associations?withReconciliation=false',
              headers: { authorization: generateValidRequestAuthorizationHeader(bigSisterAccount.id) },
              payload: {
                data: {
                  attributes: {
                    'campaign-code': littleBrotherCampaign.code,
                    'first-name': littleBrother.firstName,
                    'last-name': littleBrother.lastName,
                    birthdate: littleBrother.birthdate,
                  },
                },
              },
            });

            // then
            expect(response.statusCode).to.equal(422);
            expect(response.result.errors[0]).to.deep.equal({
              detail: "Cet utilisateur n'est pas autorisé à se réconcilier avec ce compte",
              code: 'ACCOUNT_SEEMS_TO_BELONGS_TO_ANOTHER_USER',
              meta: {
                shortCode: 'R90',
              },
              status: '422',
              title: 'Unprocessable entity',
            });
          });
        });
      });
    });
  });

  describe('POST /api/schooling-registration-user-associations/auto', function () {
    const nationalStudentId = '12345678AZ';
    let organization;
    let campaign;
    let options;
    let user;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/schooling-registration-user-associations/auto',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        nationalStudentId,
      });

      await databaseBuilder.commit();
    });

    it('should return an 200 status after having successfully associated user to organizationLearner', async function () {
      // given
      databaseBuilder.factory.buildOrganizationLearner({ userId: user.id, nationalStudentId });
      await databaseBuilder.commit();

      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'campaign-code': campaign.code,
        },
        type: 'schooling-registration-user-associations',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when user is not authenticated', function () {
      it('should respond with a 401 - unauthorized access', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when user could not be reconciled', function () {
      it('should respond with a 422 - unprocessable entity', async function () {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });

  describe('POST /api/sco-organization-learners/association/auto', function () {
    const nationalStudentId = '12345678AZ';
    let organization;
    let campaign;
    let options;
    let user;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/sco-organization-learners/association/auto',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        nationalStudentId,
      });

      await databaseBuilder.commit();
    });

    it('should return an 200 status after having successfully associated user to organizationLearner', async function () {
      // given
      databaseBuilder.factory.buildOrganizationLearner({ userId: user.id, nationalStudentId });
      await databaseBuilder.commit();

      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'campaign-code': campaign.code,
        },
        type: 'sco-organization-learners',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when user is not authenticated', function () {
      it('should respond with a 401 - unauthorized access', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when user could not be reconciled', function () {
      it('should respond with a 422 - unprocessable entity', async function () {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });
});
