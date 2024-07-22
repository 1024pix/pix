import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import {
  AcquiredBadgeForbiddenDeletionError,
  CertificationBadgeForbiddenDeletionError,
} from '../../../../../src/shared/domain/errors.js';
import { deleteUnassociatedBadge } from '../../../../../src/shared/domain/usecases/delete-unassociated-badge.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | UseCase | delete-unassociated-badge', function () {
  let domainTransaction;
  let badgeId;
  let badgeRepository;
  let complementaryCertificationBadgeRepository;

  beforeEach(async function () {
    badgeId = 'badgeId';
    badgeRepository = {
      isAssociated: sinon.stub(),
      remove: sinon.stub(),
    };
    complementaryCertificationBadgeRepository = { isRelatedToCertification: sinon.stub() };

    domainTransaction = Symbol('domainTransaction');
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
      return lambda(domainTransaction);
    });
  });

  context('When the badge is not associated to a badge acquisition', function () {
    beforeEach(function () {
      badgeRepository.isAssociated.withArgs(badgeId).resolves(false);
      badgeRepository.remove.withArgs(badgeId).resolves(true);
    });

    it('should delete the badge', async function () {
      // when
      const response = await deleteUnassociatedBadge({
        badgeId,
        badgeRepository,
        complementaryCertificationBadgeRepository,
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
        complementaryCertificationBadgeRepository,
      });

      // then
      expect(err).to.be.instanceOf(AcquiredBadgeForbiddenDeletionError);
    });
  });

  context('When the badge is related to a certification', function () {
    beforeEach(function () {
      complementaryCertificationBadgeRepository.isRelatedToCertification.withArgs(badgeId).resolves(true);
      badgeRepository.remove.withArgs(badgeId).resolves(true);
    });

    it('should not delete the badge', async function () {
      // when
      const error = await catchErr(deleteUnassociatedBadge)({
        badgeId,
        badgeRepository,
        complementaryCertificationBadgeRepository,
      });

      // then
      expect(error).to.be.instanceOf(CertificationBadgeForbiddenDeletionError);
    });
  });

  context('When the badge is not related to a certification', function () {
    beforeEach(function () {
      complementaryCertificationBadgeRepository.isRelatedToCertification.withArgs(badgeId).resolves(false);
      badgeRepository.remove.withArgs(badgeId).resolves(true);
    });

    it('should delete the badge', async function () {
      // when
      const response = await deleteUnassociatedBadge({
        badgeId,
        badgeRepository,
        complementaryCertificationBadgeRepository,
      });

      // then
      expect(response).to.equal(true);
    });
  });
});
