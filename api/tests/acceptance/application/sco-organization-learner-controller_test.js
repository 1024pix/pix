const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  generateIdTokenForExternalUser,
} = require('../../test-helper');

const createServer = require('../../../server');
const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');

describe('Acceptance | Controller | sco-organization-learners', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
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
            url: '/api/sco-organization-learners/association',
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
            url: '/api/sco-organization-learners/association',
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
            url: '/api/sco-organization-learners/association',
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
              url: '/api/sco-organization-learners/association?withReconciliation=false',
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

  describe('PUT /api/sco-organization-learners/possibilities', function () {
    let options;
    let user;
    let organization;
    let organizationLearner;
    let campaignCode;

    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization({
        isManagingStudents: true,
        type: 'SCO',
      });
      campaignCode = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
      }).code;
      user = databaseBuilder.factory.buildUser();
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userId: null,
        nationalStudentId: 'nsi123ABC',
      });
      await databaseBuilder.commit();

      options = {
        method: 'PUT',
        url: '/api/sco-organization-learners/possibilities',
        headers: {},
        payload: {
          data: {
            attributes: {
              'campaign-code': campaignCode,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          },
        },
      };
    });

    describe('Success case', function () {
      it('should return the organizationLearner linked to the user and a 200 status code response', async function () {
        //given
        const expectedResult = {
          data: {
            attributes: {
              birthdate: '2005-08-05',
              'first-name': 'Billy',
              'last-name': 'TheKid',
              username: 'billy.thekid0508',
            },
            type: 'sco-organization-learners',
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedResult);
      });
    });

    describe('Error cases', function () {
      context('when no organizationLearner can be associated because birthdate does not match', function () {
        it('should respond with a 404 - Not Found', async function () {
          // given
          options.payload.data.attributes.birthdate = '1990-03-01';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal(
            'There were no organizationLearners matching with organization and birthdate'
          );
        });
      });

      context('when no organizationLearner found to associate because names does not match', function () {
        it('should respond with a 404 - Not Found', async function () {
          // given
          options.payload.data.attributes['first-name'] = 'wrong firstName';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('There were no organizationLearners matching with names');
        });
      });

      context('when organizationLearner is already associated in the same organization', function () {
        it('should return an organization learner already linked error (short code S51 when account with email)', async function () {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: 'john.harry@example.net',
          });
          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            userId: userWithEmailOnly.id,
          });
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'S51', value: 'j***@example.net' },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
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

        it('should return an organization learner already linked error (short code S52 when connected with username)', async function () {
          // given
          const userWithUsernameOnly = databaseBuilder.factory.buildUser({
            username: 'john.harry0702',
            email: null,
          });
          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            userId: userWithUsernameOnly.id,
          });
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'S52', value: 'j***.h***2' },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
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

        it('should return an organization learner already linked error (short code S53 when account with samlId)', async function () {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: null,
          });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: '12345678',
            userId: userWithEmailOnly.id,
          });

          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            firstName: 'Sam',
            lastName: 'Lebrave',
            birthdate: '2015-10-10',
            nationalStudentId: 'samlebrave',
            organizationId: organization.id,
            userId: null,
          });
          organizationLearner.userId = userWithEmailOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'S53', value: null },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
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

      context('when organizationLearner is already associated in others organizations', function () {
        it('should respond with a 409 - Conflict', async function () {
          // given
          const organizationLearnerAlreadyMatched = databaseBuilder.factory.buildOrganizationLearner({
            birthdate: '2005-05-15',
            firstName: user.firstName,
            lastName: user.lastName,
            organizationId: organization.id,
            userId: user.id,
            nationalStudentId: 'coucoucloclo',
          });
          await databaseBuilder.commit();

          options.payload.data.attributes['first-name'] = organizationLearnerAlreadyMatched.firstName;
          options.payload.data.attributes['last-name'] = organizationLearnerAlreadyMatched.lastName;
          options.payload.data.attributes.birthdate = organizationLearnerAlreadyMatched.birthdate;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0].detail).to.equal(
            'Un compte existe déjà pour l‘élève dans le même établissement.'
          );
        });

        it('should return an organization learner already linked error (short code S61 when account with email)', async function () {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: 'john.harry@example.net',
          });
          databaseBuilder.factory.buildOrganizationLearner({
            nationalStudentId: organizationLearner.nationalStudentId,
            birthdate: organizationLearner.birthdate,
            firstName: organizationLearner.firstName,
            lastName: organizationLearner.lastName,
            userId: userWithEmailOnly.id,
          });
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'S61', value: 'j***@example.net' },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
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

        it('should return an organization learner already linked error (short code S62 when connected with username)', async function () {
          // given
          const userWithUsernameOnly = databaseBuilder.factory.buildUser({
            username: 'john.harry0702',
            email: null,
          });
          databaseBuilder.factory.buildOrganizationLearner({
            nationalStudentId: organizationLearner.nationalStudentId,
            birthdate: organizationLearner.birthdate,
            firstName: organizationLearner.firstName,
            lastName: organizationLearner.lastName,
            userId: userWithUsernameOnly.id,
          });
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'S62', value: 'j***.h***2' },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
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

        it('should return an organization learner already linked error (short code S63 when account with samlId)', async function () {
          // given
          const userWithSamlIdOnly = databaseBuilder.factory.buildUser({
            email: null,
            username: null,
          });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: '12345678',
            userId: userWithSamlIdOnly.id,
          });

          databaseBuilder.factory.buildOrganizationLearner({
            nationalStudentId: organizationLearner.nationalStudentId,
            birthdate: organizationLearner.birthdate,
            firstName: organizationLearner.firstName,
            lastName: organizationLearner.lastName,
            userId: userWithSamlIdOnly.id,
          });
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'S63', value: null },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithSamlIdOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
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

      context('when a field is not valid', function () {
        it('should respond with a 422 - Unprocessable Entity', async function () {
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

  describe('POST /api/sco-organization-learners/dependent', function () {
    let organization;
    let campaign;
    let organizationLearner;

    beforeEach(async function () {
      // given
      organization = databaseBuilder.factory.buildOrganization();
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        nationalStudentId: 'salut',
      });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('authentication-methods').delete();
    });

    context('when creation is with email', function () {
      it('should return an 204 status after having successfully created user and associated user to organizationLearner', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/sco-organization-learners/dependent',
          payload: {
            data: {
              attributes: {
                'campaign-code': campaign.code,
                'first-name': organizationLearner.firstName,
                'last-name': organizationLearner.lastName,
                birthdate: organizationLearner.birthdate,
                password: 'P@ssw0rd',
                email: 'angie@example.net',
                'with-username': false,
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(204);
      });

      context('when no organizationLearner not linked yet found', function () {
        it('should respond with a 409 - Conflict', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organizationLearnerAlreadyLinked = databaseBuilder.factory.buildOrganizationLearner({
            firstName: 'josé',
            lastName: 'bové',
            birthdate: '2020-01-01',
            organizationId: organization.id,
            userId,
            nationalStudentId: 'coucou',
          });
          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/sco-organization-learners/dependent',
            payload: {
              data: {
                attributes: {
                  'campaign-code': campaign.code,
                  'first-name': organizationLearnerAlreadyLinked.firstName,
                  'last-name': organizationLearnerAlreadyLinked.lastName,
                  birthdate: organizationLearnerAlreadyLinked.birthdate,
                  password: 'P@ssw0rd',
                  email: 'angie@example.net',
                  'with-username': false,
                },
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0].detail).to.equal(
            'Un compte existe déjà pour l‘élève dans le même établissement.'
          );
        });
      });

      context('when a field is not valid', function () {
        it('should respond with a 422 - Unprocessable Entity', async function () {
          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/sco-organization-learners/dependent',
            payload: {
              data: {
                attributes: {
                  'campaign-code': campaign.code,
                  'first-name': organizationLearner.firstName,
                  'last-name': organizationLearner.lastName,
                  birthdate: organizationLearner.birthdate,
                  password: 'P@ssw0rd',
                  email: 'not valid email',
                  'with-username': false,
                },
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(422);
        });
      });
    });

    context('when creation is with username', function () {
      it('should return a 204 status after having successfully created user and associated user to organizationLearner', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/sco-organization-learners/dependent',
          payload: {
            data: {
              attributes: {
                'campaign-code': campaign.code,
                'first-name': organizationLearner.firstName,
                'last-name': organizationLearner.lastName,
                birthdate: organizationLearner.birthdate,
                password: 'P@ssw0rd',
                username: 'angie.go1234',
                'with-username': true,
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(204);
      });

      context('when username is already taken', function () {
        it('should respond with a 422 - Unprocessable entity', async function () {
          // given
          const username = 'angie.go1234';
          databaseBuilder.factory.buildUser({ username });
          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/sco-organization-learners/dependent',
            payload: {
              data: {
                attributes: {
                  'campaign-code': campaign.code,
                  'first-name': organizationLearner.firstName,
                  'last-name': organizationLearner.lastName,
                  birthdate: organizationLearner.birthdate,
                  password: 'P@ssw0rd',
                  username,
                  'with-username': true,
                },
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(422);
          expect(response.result.errors[0].detail).to.equal(
            'Cet identifiant n’est plus disponible, merci de recharger la page.'
          );
        });
      });
    });
  });

  describe('POST /api/sco-organization-learners/external', function () {
    let organization;
    let campaign;
    let options;
    let organizationLearner;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/sco-organization-learners/external',
        headers: {},
        payload: {},
      };

      organization = databaseBuilder.factory.buildOrganization({ identityProvider: 'SCO' });
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'josé',
        lastName: 'bové',
        birthdate: '2020-01-01',
        nationalStudentId: 'josébové123',
        organizationId: organization.id,
        userId: null,
      });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      await databaseBuilder.commit();
    });

    afterEach(function () {
      return knex('authentication-methods').delete();
    });

    context('when an external user try to reconcile for the first time', function () {
      it('should return an 200 status after having successfully created the user and associated it to organizationLearner', async function () {
        // given
        const externalUser = {
          lastName: organizationLearner.lastName,
          firstName: organizationLearner.firstName,
          samlId: '123456789',
        };
        const idTokenForExternalUser = generateIdTokenForExternalUser(externalUser);

        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'external-user-token': idTokenForExternalUser,
            birthdate: organizationLearner.birthdate,
            'access-token': null,
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      context('When external user is already reconciled', function () {
        it('should replace the existing user samlId already reconciled in the other organization with the authenticated user samlId', async function () {
          // given
          const user = databaseBuilder.factory.buildUser({
            firstName: organizationLearner.firstName,
            lastName: organizationLearner.lastName,
            birthdate: organizationLearner.birthdate,
          });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: '12345678',
            userId: user.id,
          });

          const otherOrganization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
          databaseBuilder.factory.buildOrganizationLearner({
            organizationId: otherOrganization.id,
            firstName: organizationLearner.firstName,
            lastName: organizationLearner.lastName,
            birthdate: organizationLearner.birthdate,
            nationalStudentId: organizationLearner.nationalStudentId,
            userId: user.id,
          });
          await databaseBuilder.commit();

          const externalUser = {
            lastName: organizationLearner.lastName,
            firstName: organizationLearner.firstName,
            samlId: '9876654321',
          };
          const idTokenForExternalUser = generateIdTokenForExternalUser(externalUser);

          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'external-user-token': idTokenForExternalUser,
              birthdate: organizationLearner.birthdate,
              'access-token': null,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.payload).to.contains('access-token');
          const result = await knex('authentication-methods').where({
            userId: user.id,
            identityProvider: AuthenticationMethod.identityProviders.GAR,
          });
          const garAuthenticationMethod = result[0];
          expect(garAuthenticationMethod.externalIdentifier).to.equal(externalUser.samlId);
        });

        it('should replace the existing user samlId already reconciled in the same organization found with the authenticated user samlId', async function () {
          // given
          const userWithSamlIdOnly = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: '12345678',
            userId: userWithSamlIdOnly.id,
          });

          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            userId: userWithSamlIdOnly.id,
            firstName: userWithSamlIdOnly.firstName,
            lastName: userWithSamlIdOnly.lastName,
            birthdate: userWithSamlIdOnly.birthdate,
          });
          await databaseBuilder.commit();

          const externalUser = {
            lastName: organizationLearner.lastName,
            firstName: organizationLearner.firstName,
            samlId: '9876654321',
          };
          const idTokenForExternalUser = generateIdTokenForExternalUser(externalUser);

          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'external-user-token': idTokenForExternalUser,
              birthdate: organizationLearner.birthdate,
              'access-token': null,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.payload).to.contains('access-token');
          const result = await knex('authentication-methods').where({
            userId: userWithSamlIdOnly.id,
            identityProvider: AuthenticationMethod.identityProviders.GAR,
          });
          const garAuthenticationMethod = result[0];
          expect(garAuthenticationMethod.externalIdentifier).to.equal(externalUser.samlId);
        });
      });

      context('when external user id token is not valid', function () {
        it('should respond with a 401 - unauthorized access', async function () {
          // given
          const invalidIdToken = 'invalid.id.token';

          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'external-user-token': invalidIdToken,
              birthdate: organizationLearner.birthdate,
              'access-token': null,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });

  describe('POST /api/sco-organization-learners/password-update', function () {
    let organizationId;
    let options;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/sco-organization-learners/password-update',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'organization-learner-id': null,
            },
          },
        },
      };
    });

    it('should return a 200 status after having successfully updated the password', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId,
      }).id;
      options.payload.data.attributes['organization-learner-id'] = organizationLearnerId;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 404 status when organizationLearner does not exist', async function () {
      // given
      options.payload.data.attributes['organization-learner-id'] = 1;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it("should return a 404 status when organizationLearner's userId does not exist", async function () {
      // given
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId: null,
      }).id;
      options.payload.data.attributes['organization-learner-id'] = organizationLearnerId;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 403 status when user does not belong to the same organization as organizationLearner', async function () {
      // given
      const wrongOrganization = databaseBuilder.factory.buildOrganization();
      const organizationLearnerWithWrongOrganization = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: wrongOrganization.id,
      });
      await databaseBuilder.commit();

      options.payload.data.attributes['organization-learner-id'] = organizationLearnerWithWrongOrganization.id;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/sco-organization-learners/username-password-generation', function () {
    let organizationId;
    let organizationLearnerId;
    let options;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        isManagingStudents: true,
      }).id;
      const userId = databaseBuilder.factory.buildUser.withRawPassword({
        username: null,
      }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId,
      }).id;

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/sco-organization-learners/username-password-generation',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'organization-learner-id': organizationLearnerId,
            },
          },
        },
      };
    });

    it('should return a 200 status after having successfully generated username and temporary password', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 404 status when organizationLearner does not exist', async function () {
      // given
      options.payload.data.attributes['organization-learner-id'] = organizationLearnerId + 1;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it("should return a 404 status when organizationLearner's userId does not exist", async function () {
      // given
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId: null,
      }).id;
      options.payload.data.attributes['organization-learner-id'] = organizationLearnerId;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 403 status when student does not belong to the same organization as organizationLearner', async function () {
      // given
      options.payload.data.attributes['organization-id'] = organizationId + 1;
      options.payload.data.attributes['organization-learner-id'] = organizationLearnerId;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should return a 403 status when user does not belong to the same organization as organizationLearner', async function () {
      // given
      const wrongOrganization = databaseBuilder.factory.buildOrganization();
      const organizationLearnerWithWrongOrganization = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: wrongOrganization.id,
      });
      await databaseBuilder.commit();

      options.payload.data.attributes['organization-learner-id'] = organizationLearnerWithWrongOrganization.id;
      options.payload.data.attributes['organization-id'] = wrongOrganization.id;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/schooling-registration-dependent-users/recover-account', function () {
    it('should return a 200 status and student information for account recovery', async function () {
      // given
      const studentInformation = {
        ineIna: '123456789AA',
        firstName: 'Jude',
        lastName: 'Law',
        birthdate: '2016-06-01',
      };
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        id: 8,
        firstName: 'Judy',
        lastName: 'Howl',
        email: 'jude.law@example.net',
        username: 'jude.law0601',
      });
      const organization = databaseBuilder.factory.buildOrganization({
        id: 7,
        name: 'Collège Hollywoodien',
      });
      const latestOrganization = databaseBuilder.factory.buildOrganization({
        id: 2,
        name: 'Super Collège Hollywoodien',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
        ...studentInformation,
        nationalStudentId: studentInformation.ineIna,
        organizationId: organization.id,
        updatedAt: new Date('2005-01-01T15:00:00Z'),
      });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
        ...studentInformation,
        nationalStudentId: studentInformation.ineIna,
        organizationId: latestOrganization.id,
        updatedAt: new Date('2010-01-01T15:00:00Z'),
      });

      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: '/api/schooling-registration-dependent-users/recover-account',
        payload: {
          data: {
            type: 'student-information',
            attributes: {
              'ine-ina': studentInformation.ineIna,
              'first-name': studentInformation.firstName,
              'last-name': studentInformation.lastName,
              birthdate: studentInformation.birthdate,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      expect(response.result.data).to.deep.equal({
        type: 'student-information-for-account-recoveries',
        attributes: {
          'first-name': 'Jude',
          'last-name': 'Law',
          username: 'jude.law0601',
          email: 'jude.law@example.net',
          'latest-organization-name': 'Super Collège Hollywoodien',
        },
      });
    });
  });

  describe('POST /api/sco-organization-learners/account-recovery', function () {
    it('should return a 200 status and student information for account recovery', async function () {
      // given
      const studentInformation = {
        ineIna: '123456789AA',
        firstName: 'Jude',
        lastName: 'Law',
        birthdate: '2016-06-01',
      };
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        id: 8,
        firstName: 'Judy',
        lastName: 'Howl',
        email: 'jude.law@example.net',
        username: 'jude.law0601',
      });
      const organization = databaseBuilder.factory.buildOrganization({
        id: 7,
        name: 'Collège Hollywoodien',
      });
      const latestOrganization = databaseBuilder.factory.buildOrganization({
        id: 2,
        name: 'Super Collège Hollywoodien',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
        ...studentInformation,
        nationalStudentId: studentInformation.ineIna,
        organizationId: organization.id,
        updatedAt: new Date('2005-01-01T15:00:00Z'),
      });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
        ...studentInformation,
        nationalStudentId: studentInformation.ineIna,
        organizationId: latestOrganization.id,
        updatedAt: new Date('2010-01-01T15:00:00Z'),
      });

      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: '/api/sco-organization-learners/account-recovery',
        payload: {
          data: {
            type: 'student-information',
            attributes: {
              'ine-ina': studentInformation.ineIna,
              'first-name': studentInformation.firstName,
              'last-name': studentInformation.lastName,
              birthdate: studentInformation.birthdate,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      expect(response.result.data).to.deep.equal({
        type: 'student-information-for-account-recoveries',
        attributes: {
          'first-name': 'Jude',
          'last-name': 'Law',
          username: 'jude.law0601',
          email: 'jude.law@example.net',
          'latest-organization-name': 'Super Collège Hollywoodien',
        },
      });
    });
  });
});
