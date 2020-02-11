const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getUserWithOrgaSettings = require('../../../../lib/domain/usecases/get-user-with-orga-settings');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | get-user-with-orga-settings', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { getWithOrgaSettings: sinon.stub() };
  });

  it('should return a User with its Memberships', async () => {
    // given
    const fetchedUser = domainBuilder.buildUser();
    userRepository.getWithOrgaSettings.resolves(fetchedUser);

    // when
    const result = await getUserWithOrgaSettings({
      userId: fetchedUser.id,
      userRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(User);
    expect(result).to.equal(fetchedUser);
    expect(userRepository.getWithOrgaSettings).to.have.been.calledOnce;
  });
});
