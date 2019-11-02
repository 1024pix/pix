const { databaseBuilder, expect, generateValidRequestAuthorizationHeader } = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-user-student', () => {

  let options;
  let server;
  let user;
  let userWithOutStudent;
  let organization;
  let student;

  beforeEach(async () => {
    server = await createServer();

    organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
    user = databaseBuilder.factory.buildUser();
    userWithOutStudent = databaseBuilder.factory.buildUser();
    student = databaseBuilder.factory.buildStudent({ organizationId: organization.id, userId: user.id });
    await databaseBuilder.commit();
    options = {
      method: 'GET',
      url: '/api/users/' + user.id + '/student',
      payload: {},
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };
  });

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  describe('GET /users/:id/student', () => {

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

      it('should return the student linked to the user and a 200 status code response ', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['first-name']).to.deep.equal(student.firstName);
        expect(response.result.data.attributes['last-name']).to.deep.equal(student.lastName);
        expect(response.result.data.attributes['birthdate']).to.deep.equal(student.birthdate);
      });
    });

    describe('There is no student linked to the user', () => {

      it('should return a data null', async () => {
        // given
        options = {
          method: 'GET',
          url: '/api/users/' + userWithOutStudent.id + '/student',
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userWithOutStudent.id) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data).to.equal(null);
      });
    });
  });
});
