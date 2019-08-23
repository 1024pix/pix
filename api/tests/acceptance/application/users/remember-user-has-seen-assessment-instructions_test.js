const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-remember-user-has-seen-assessment-instructions', () => {

  let server;
  let user;

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({ hasSeenAssessmentInstructions: false });

    return databaseBuilder.commit();
  });

  afterEach(() => {
    return databaseBuilder.clean();
  });

  it('should return the user with hasSeenAssessmentInstructions', async () => {
    // given
    const options = {
      method: 'PATCH',
      url: `/api/users/${user.id}/remember-user-has-seen-assessment-instructions`,
      // payload: {},
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    // when
    const response = await server.inject(options);

    // then
    expect(response.result.data.attributes['has-seen-assessment-instructions']).to.be.true;
  });
});
