const { expect, databaseBuilder } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | Student-dependent-user', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/student-dependent-user', () => {
    let organization;
    let campaign;
    let options;
    let student;

    beforeEach(async () => {
      // given
      organization = databaseBuilder.factory.buildOrganization();
      student = databaseBuilder.factory.buildStudent({ organizationId: organization.id, userId: null });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/student-dependent-users',
        headers: {},
        payload: {
          data: {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': student.firstName,
              'last-name': student.lastName,
              'birthdate': student.birthdate,
              'password': 'P@ssw0rd',
            }
          }
        }
      };
    });

    context('when creation is with email', () => {

      const email = 'angie@example.net';

      beforeEach(async () => {
        options.payload.data.attributes.email = email;
        options.payload.data.attributes['with-username'] = false;
      });

      it('should return an 201 status after having successfully created user and associated user to student', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.attributes.email).to.equal(email);
        expect(response.result.data.attributes['first-name']).to.equal(student.firstName);
        expect(response.result.data.attributes['last-name']).to.equal(student.lastName);
      });

      context('when no student not linked yet found', () => {

        it('should respond with a 409 - Conflict', async () => {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const studentAlreadyLinked = databaseBuilder.factory.buildStudent({
            organizationId: organization.id,
            userId
          });
          await databaseBuilder.commit();

          options.payload.data.attributes['first-name'] = studentAlreadyLinked.firstName;
          options.payload.data.attributes['last-name'] = studentAlreadyLinked.lastName;
          options.payload.data.attributes['birthdate'] = studentAlreadyLinked.birthdate;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0].detail).to.equal('L\'élève est déjà rattaché à un compte utilisateur.');
        });
      });

      context('when a field is not valid', () => {

        it('should respond with a 422 - Unprocessable Entity', async () => {
          // given
          options.payload.data.attributes.email = 'not valid email';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });
    });

    context('when creation is with username', () => {

      const username = 'angie.go1234';

      beforeEach(async () => {
        options.payload.data.attributes.username = username;
        options.payload.data.attributes['with-username'] = true;
      });

      it('should return an 201 status after having successfully created user and associated user to student', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.attributes.username).to.equal(username);
        expect(response.result.data.attributes['first-name']).to.equal(student.firstName);
        expect(response.result.data.attributes['last-name']).to.equal(student.lastName);
      });

      context('when username is already taken', () => {

        it('should respond with a 422 - Unprocessable entity', async () => {
          // given
          databaseBuilder.factory.buildUser({ username });
          await databaseBuilder.commit();

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
          expect(response.result.errors[0].detail).to.equal('Cet identifiant est déjà utilisé, rechargez la page.');
        });
      });
    });
  });
});
