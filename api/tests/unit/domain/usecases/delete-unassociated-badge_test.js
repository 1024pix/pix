import { sinon, expect, catchErr } from '../../../test-helper';
import deleteUnassociatedBadge from '../../../../lib/domain/usecases/delete-unassociated-badge';

import {
  AcquiredBadgeForbiddenDeletionError,
  CertificationBadgeForbiddenDeletionError,
} from '../../../../lib/domain/errors';

describe('Unit | UseCase | delete-unassociated-badge', function () {
  let badgeId;
  let badgeRepository;

  beforeEach(async function () {
    badgeId = 'badgeId';
    badgeRepository = {
      isAssociated: sinon.stub(),
      delete: sinon.stub(),
      isRelatedToCertification: sinon.stub(),
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
      expect(response).to.equal(true);
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
      expect(err).to.be.instanceOf(AcquiredBadgeForbiddenDeletionError);
    });
  });

  context('When the badge is related to a certification', function () {
    beforeEach(function () {
      badgeRepository.isRelatedToCertification.withArgs(badgeId).resolves(true);
      badgeRepository.delete.withArgs(badgeId).resolves(true);
    });

    it('should not delete the badge', async function () {
      // when
      const error = await catchErr(deleteUnassociatedBadge)({
        badgeId,
        badgeRepository,
      });

      // then
      expect(error).to.be.instanceOf(CertificationBadgeForbiddenDeletionError);
    });
  });

  context('When the badge is not related to a certification', function () {
    beforeEach(function () {
      badgeRepository.isRelatedToCertification.withArgs(badgeId).resolves(false);
      badgeRepository.delete.withArgs(badgeId).resolves(true);
    });

    it('should delete the badge', async function () {
      // when
      const response = await deleteUnassociatedBadge({
        badgeId,
        badgeRepository,
      });

      // then
      expect(response).to.equal(true);
    });
  });
});
