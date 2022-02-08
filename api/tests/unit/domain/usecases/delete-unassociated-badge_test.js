const { sinon, expect, catchErr } = require('../../../test-helper');

const deleteUnassociatedBadge = require('../../../../lib/domain/usecases/delete-unassociated-badge');
const { BadgeForbiddenDeletionError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | delete-unassociated-badge', function () {
  let badgeId;
  let badgeRepository;

  beforeEach(async function () {
    badgeId = 'badgeId';
    badgeRepository = {
      isAssociated: sinon.stub(),
      delete: sinon.stub(),
    };
  });

  context('When the badge is not associated to a badge acquisition', function () {
    beforeEach(function () {
      badgeRepository.isAssociated.withArgs(badgeId).resolves(false);
      badgeRepository.delete.withArgs(badgeId).resolves(true);
    });

    it('should delete the badge', async function () {
      // when
      const response = await deleteUnassociatedBadge({
        badgeId,
        badgeRepository,
      });

      // then
      expect(response).to.deep.equal(true);
    });
  });

  context('When the badge is associated to a badge acquisition', function () {
    beforeEach(function () {
      badgeRepository.isAssociated.withArgs(badgeId).resolves(true);
    });

    it('should throw a forbidden deletion error', async function () {
      // when
      const err = await catchErr(deleteUnassociatedBadge)({
        badgeId,
        badgeRepository,
      });

      // then
      expect(err).to.be.instanceOf(BadgeForbiddenDeletionError);
    });
  });
});
