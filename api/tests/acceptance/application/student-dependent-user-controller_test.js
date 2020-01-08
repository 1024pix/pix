const { expect, databaseBuilder } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | Student-dependent-user', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/student-dependent-user', () => {
    const email = 'angie@example.net';
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
              email,
              'password': 'P@ssw0rd',
            }
          }
        }
      };
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

      it('should return an 404 NotFoundError error', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const studentAlreadyLinked = databaseBuilder.factory.buildStudent({ organizationId: organization.id, userId });
        await databaseBuilder.commit();

        options.payload.data.attributes['first-name'] = studentAlreadyLinked.firstName;
        options.payload.data.attributes['last-name'] = studentAlreadyLinked.lastName;
        options.payload.data.attributes['birthdate'] = studentAlreadyLinked.birthdate;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
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
});
