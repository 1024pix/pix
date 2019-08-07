const { expect, generateValidRequestAuhorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-remember-user-has-seen-new-profile-info', () => {

  let server;
  let user;

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({ hasSeenNewProfileInfo: false });

    return databaseBuilder.commit();
  });

  afterEach(() => {
    return databaseBuilder.clean();
  });

  it('should returns the user with hasSeenNewProfileInfo', async () => {
    // given
    const options = {
      method: 'PATCH',
      url: `/api/users/${user.id}/remember-user-has-seen-new-profile-info`,
      // payload: {},
      headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
    };

    // when
    const response = await server.inject(options);

    // then
    expect(response.result.data.attributes['has-seen-new-profile-info']).to.be.true;
  });
});
