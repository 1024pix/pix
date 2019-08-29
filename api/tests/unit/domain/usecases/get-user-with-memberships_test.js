const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getUserWithMemberships = require('../../../../lib/domain/usecases/get-user-with-memberships');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | get-user-with-memberships', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { getWithMemberships: sinon.stub() };
  });

  it('should return a User with its Memberships', async () => {
    // given
    const fetchedUser = domainBuilder.buildUser();
    userRepository.getWithMemberships.resolves(fetchedUser);

    // when
    const result = await getUserWithMemberships({
      userId: fetchedUser.id,
      userRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(User);
    expect(result).to.equal(fetchedUser);
    expect(userRepository.getWithMemberships).to.have.been.calledOnce;
  });
});
