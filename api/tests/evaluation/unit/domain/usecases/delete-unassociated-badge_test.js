import sinon from 'sinon';

import {
  AcquiredBadgeForbiddenDeletionError,
  CertificationBadgeForbiddenDeletionError,
} from '../../../../../src/evaluation/domain/errors.js';
import { deleteUnassociatedBadge } from '../../../../../src/evaluation/domain/usecases/delete-unassociated-badge.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { expect } from '../../../../test-helper.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Evaluation | Domain | UseCase | delete-unassociated-badge', function () {
  let badgeId;
  let badgeRepository;
  let complementaryCertificationBadgeRepository;

  beforeEach(async function () {
    badgeId = 'badgeId';
    badgeRepository = {
      isAssociated: sinon.stub(),
      remove: sinon.stub(),
    };
    complementaryCertificationBadgeRepository = { isAttachedToComplementaryCertification: sinon.stub() };

    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
      return lambda();
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
      complementaryCertificationBadgeRepository.isAttachedToComplementaryCertification.withArgs(badgeId).resolves(true);
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
      complementaryCertificationBadgeRepository.isAttachedToComplementaryCertification
        .withArgs(badgeId)
        .resolves(false);
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
