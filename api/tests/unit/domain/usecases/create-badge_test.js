const { expect, sinon, catchErr } = require('../../../test-helper');
const createBadge = require('../../../../lib/domain/usecases/create-badge');
const { AlreadyExistingEntityError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-badge', function () {
  it('should call the badge repository to persist badge', async function () {
    // given
    const targetProfileId = 1;
    const badgeCreated = Symbol('created-badge');
    const targetProfileRepository = { get: sinon.stub().resolves({ id: targetProfileId }) };
    const badgeRepository = { isKeyAvailable: sinon.stub().resolves(true), save: sinon.stub().resolves(badgeCreated) };
    const badge = { title: 'My badge' };
    const badgeWithTargetProfile = { ...badge, targetProfileId };

    // when
    const result = await createBadge({
      targetProfileId,
      badgeCreation: badge,
      badgeRepository,
      targetProfileRepository,
    });

    // then
    expect(badgeRepository.save).to.have.been.calledWith(badgeWithTargetProfile);
    expect(result).to.equal(badgeCreated);
  });

  describe('when targetProfile not exist', function () {
    it('should throw an error', async function () {
      // given
      const targetProfileId = 1;
      const badge = {};
      const targetProfileRepository = { get: sinon.stub().throws(new NotFoundError()) };
      const badgeRepository = { save: sinon.stub() };

      // when
      const error = await catchErr(createBadge)({
        targetProfileId,
        badgeCreation: badge,
        badgeRepository,
        targetProfileRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('when badge key is already used', function () {
    it('should throw an AlreadyExistingEntityError', async function () {
      // given
      const targetProfileId = 1;
      const badge = {};
      const targetProfileRepository = { get: sinon.stub().resolves({ id: 1 }) };
      const badgeRepository = { isKeyAvailable: sinon.stub().throws(new AlreadyExistingEntityError()) };

      // when
      const error = await catchErr(createBadge)({
        targetProfileId,
        badgeCreation: badge,
        badgeRepository,
        targetProfileRepository,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyExistingEntityError);
    });
  });
});
