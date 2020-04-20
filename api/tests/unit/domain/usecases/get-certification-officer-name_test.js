const { expect, sinon, catchErr } = require('../../../test-helper');
const getCertificationOfficerInfo = require('../../../../lib/domain/usecases/get-certification-officer-info');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-certification-officer-info', () => {
  let userId;
  let userRepository;

  beforeEach(() => {
    userRepository = { get: sinon.stub() };
  });

  context('when user id is not a number', () => {

    it('should throw a NotFound error', async () => {
      // given
      userId = 'notANumber';

      // when
      const error = await catchErr(getCertificationOfficerInfo)({ userId, userRepository });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });

  context('when user id is a number', () => {
    const returnedUser = Symbol('returnedUser');

    beforeEach(() => {
      userId = 1;
      userRepository.get.withArgs(userId).resolves(returnedUser);
    });

    it('should return the user', async () => {
      // when
      const actualUser = await getCertificationOfficerInfo({ userId, userRepository });

      // then
      expect(actualUser).to.equal(returnedUser);
    });
  });
});
