import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { attachBadges } from '../../../../../../src/certification/complementary-certification/domain/usecases/attach-badges.js';
import { MissingAttributesError, NotFoundError } from '../../../../../../lib/domain/errors.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { InvalidBadgeLevelError } from '../../../../../../src/certification/complementary-certification/domain/errors.js';

describe('Unit | UseCase | attach-badges', function () {
  let complementaryCertificationForAdminRepository, badgeRepository;
  let clock;
  const now = new Date('2023-02-02');

  beforeEach(function () {
    complementaryCertificationForAdminRepository = {
      getById: sinon.stub(),
    };
    badgeRepository = {
      findAllByIds: sinon.stub(),
    };
    clock = sinon.useFakeTimers(now);
  });
  afterEach(function () {
    clock.restore();
  });

  context('check badges levels business rules', function () {
    it('should have at least one badge', async function () {
      // given
      const emptyBadgesList = [];

      // when
      const error = await catchErr(attachBadges)({
        complementaryCertificationBadgesToAttachDTO: emptyBadgesList,
      });

      // then
      expect(error).to.be.instanceOf(InvalidBadgeLevelError);
      expect(error.code).to.equal('INVALID_BADGE_LEVEL');
      expect(error.message).to.equal('Badge level inconsistency');
    });

    it('should not allow a level below 1', async function () {
      // given
      const badgesWithALevel0 = [
        { badgeId: 100, level: 1 },
        { badgeId: 101, level: 0 },
      ];

      // when
      const error = await catchErr(attachBadges)({
        complementaryCertificationBadgesToAttachDTO: badgesWithALevel0,
      });

      // then
      expect(error).to.be.instanceOf(InvalidBadgeLevelError);
      expect(error.code).to.equal('INVALID_BADGE_LEVEL');
      expect(error.message).to.equal('Badge level inconsistency');
    });

    it('should not allow a level above the number of badges (4 badges, max level = 4)', async function () {
      // given
      const twoBadgesWithALevelThree = [
        { badgeId: 100, level: 1 },
        { badgeId: 101, level: 3 },
      ];

      // when
      const error = await catchErr(attachBadges)({
        complementaryCertificationBadgesToAttachDTO: twoBadgesWithALevelThree,
      });

      // then
      expect(error).to.be.instanceOf(InvalidBadgeLevelError);
      expect(error.code).to.equal('INVALID_BADGE_LEVEL');
      expect(error.message).to.equal('Badge level inconsistency');
    });

    it('should not allow a badge without a level', async function () {
      // given
      const badgesAndOneWithoutALevel = [{ badgeId: 100, level: 1 }, { badgeId: 101 }];

      // when
      const error = await catchErr(attachBadges)({
        complementaryCertificationBadgesToAttachDTO: badgesAndOneWithoutALevel,
      });

      // then
      expect(error).to.be.instanceOf(InvalidBadgeLevelError);
      expect(error.code).to.equal('INVALID_BADGE_LEVEL');
      expect(error.message).to.equal('Badge level inconsistency');
    });

    it('should not allow badges where level are not uniq', async function () {
      // given
      const badgesWithoutUniqLevel = [{ badgeId: 100, level: 1 }, { badgeId: 1 }];

      // when
      const error = await catchErr(attachBadges)({
        complementaryCertificationBadgesToAttachDTO: badgesWithoutUniqLevel,
      });

      // then
      expect(error).to.be.instanceOf(InvalidBadgeLevelError);
      expect(error.code).to.equal('INVALID_BADGE_LEVEL');
      expect(error.message).to.equal('Badge level inconsistency');
    });
  });

  context('when complementary certification has external jury and one required attributes is missing', function () {
    it('should return MissingAttributesError', async function () {
      // given
      complementaryCertificationForAdminRepository.getById.withArgs({ complementaryCertificationId: 123 }).resolves(
        domainBuilder.buildComplementaryCertificationForAdmin({
          id: 123,
          hasExternalJury: true,
        }),
      );
      badgeRepository.findAllByIds.resolves([{ badgeId: 1 }, { badgeId: 2 }]);

      // when
      const error = await catchErr(attachBadges)({
        complementaryCertificationBadgesToAttachDTO: [
          { badgeId: 1, level: 1, certificateMessage: 'message', temporaryCertificateMessage: 'temporary message' },
          { badgeId: 2, level: 2, certificateMessage: null, temporaryCertificateMessage: 'temporary message' },
        ],
        complementaryCertificationId: 123,
        badgeRepository,
        complementaryCertificationForAdminRepository,
      });

      // then
      expect(error).to.be.instanceOf(MissingAttributesError);
      expect(error.message).to.equal(
        'Certificate and temporary certificate messages are required for complementary certification with external jury',
      );
    });
  });

  context('when one or more badges do not exist', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { label: 'no badges found', resolve: [] },
      { label: 'not all badges found', resolve: [{ badgeId: 1 }] },
    ].forEach((assessment) => {
      // eslint-disable-next-line mocha/no-setup-in-describe
      context(`when  ${assessment.label}`, function () {
        it('should throw a not found error', async function () {
          // given
          badgeRepository.findAllByIds.resolves(assessment.resolve);

          // when
          const error = await catchErr(attachBadges)({
            complementaryCertificationId: 12,
            complementaryCertificationBadgesToAttachDTO: [
              { badgeId: 1, level: 1 },
              { badgeId: 2, level: 2 },
            ],
            badgeRepository,
          });

          // then
          expect(error).to.be.instanceOf(NotFoundError);
          expect(error.message).to.equal("One or several badges don't exist.");
        });
      });
    });
  });

  context('when levels checks are ok', function () {
    context('when complementary certification badges are already attached to the profile', function () {
      it('should detach old complementary certification badges', async function () {
        // given
        const domainTransaction = {
          knexTransaction: Symbol('transaction'),
        };
        sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
          return callback(domainTransaction);
        });
        const badge1 = domainBuilder.buildBadge({ id: 123 });
        const badge2 = domainBuilder.buildBadge({ id: 456 });

        complementaryCertificationForAdminRepository.getById.withArgs({ complementaryCertificationId: 123 }).resolves(
          domainBuilder.buildComplementaryCertificationForAdmin({
            id: 123,
            hasExternalJury: false,
          }),
        );
        badgeRepository.findAllByIds.resolves([badge1, badge2]);
        const complementaryCertificationBadgesRepository = {
          attach: sinon.stub().resolves(),
          detachByIds: sinon.stub(),
          getAllIdsByTargetProfileId: sinon.stub(),
        };

        complementaryCertificationBadgesRepository.getAllIdsByTargetProfileId
          .withArgs({ targetProfileId: 789 })
          .resolves([1, 2]);

        // when
        await attachBadges({
          userId: 1234,
          complementaryCertificationBadgesToAttachDTO: [
            { badgeId: 123, level: 2, label: 'badge_1' },
            { badgeId: 456, level: 1, label: 'badge_2' },
          ],
          targetProfileIdToDetach: 789,
          complementaryCertificationId: 123,
          badgeRepository,
          complementaryCertificationForAdminRepository,
          complementaryCertificationBadgesRepository,
        });

        // then
        expect(complementaryCertificationBadgesRepository.detachByIds).to.have.been.calledWith({
          complementaryCertificationBadgeIds: [1, 2],
          domainTransaction,
        });
      });

      it('should attach new complementary certification badges', async function () {
        // given
        const domainTransaction = {
          knexTransaction: Symbol('transaction'),
        };
        sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
          return callback(domainTransaction);
        });
        const badge1 = domainBuilder.buildBadge({ id: 123 });

        const complementaryCertificationBadge = {
          badgeId: 123,
          label: 'badge_1',
          level: 1,
          imageUrl: 'svg.pix.toto.com',
          stickerUrl: 'svg.pix.toto.com',
          certificateMessage: null,
          temporaryCertificateMessage: null,
        };

        complementaryCertificationForAdminRepository.getById.withArgs({ complementaryCertificationId: 123 }).resolves(
          domainBuilder.buildComplementaryCertificationForAdmin({
            id: 123,
            hasExternalJury: false,
          }),
        );
        badgeRepository.findAllByIds.resolves([badge1]);
        const complementaryCertificationBadgesRepository = {
          attach: sinon.stub(),
          detachByIds: sinon.stub().resolves(),
          getAllIdsByTargetProfileId: sinon.stub().resolves([
            domainBuilder.buildBadgeToAttach({
              id: 1,
              label: 'pix+ label 1',
              badgeId: 123,
              level: 1,
            }).badgeId,
          ]),
        };

        // when
        await attachBadges({
          userId: 1234,
          complementaryCertificationBadgesToAttachDTO: [complementaryCertificationBadge],
          targetProfileIdToDetach: 456,
          complementaryCertificationId: 123,
          badgeRepository,
          complementaryCertificationForAdminRepository,
          complementaryCertificationBadgesRepository,
        });

        // then
        const newComplementaryCertificationBadge = domainBuilder.buildBadgeToAttach({
          ...complementaryCertificationBadge,
          createdAt: now,
          complementaryCertificationId: 123,
          createdBy: 1234,
        });
        expect(complementaryCertificationBadgesRepository.attach).to.have.been.calledWith({
          complementaryCertificationBadge: newComplementaryCertificationBadge,
          domainTransaction,
        });
      });
    });
  });

  context('when there is no badges associated to target profile', function () {
    it('should throw an error', async function () {
      // given
      const domainTransaction = {
        knexTransaction: Symbol('transaction'),
      };
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback(domainTransaction);
      });
      const badge1 = domainBuilder.buildBadge({ id: 123 });
      const badge2 = domainBuilder.buildBadge({ id: 456 });

      complementaryCertificationForAdminRepository.getById.withArgs({ complementaryCertificationId: 123 }).resolves(
        domainBuilder.buildComplementaryCertificationForAdmin({
          id: 123,
          hasExternalJury: false,
        }),
      );
      badgeRepository.findAllByIds.resolves([badge1, badge2]);
      const complementaryCertificationBadgesRepository = {
        attach: sinon.stub().resolves(),
        detachByIds: sinon.stub(),
        getAllIdsByTargetProfileId: sinon.stub(),
      };
      const BadgeToAttachValidator = {
        validate: sinon.stub().resolves(),
      };
      complementaryCertificationBadgesRepository.getAllIdsByTargetProfileId
        .withArgs({ targetProfileId: 789 })
        .resolves([]);

      // when
      const error = await catchErr(attachBadges)({
        userId: 1234,
        complementaryCertificationBadgesToAttachDTO: [
          { badgeId: 123, level: 2, label: 'badge_1' },
          { badgeId: 456, level: 1, label: 'badge_2' },
        ],
        targetProfileIdToDetach: 789,
        complementaryCertificationId: 123,
        BadgeToAttachValidator,
        badgeRepository,
        complementaryCertificationForAdminRepository,
        complementaryCertificationBadgesRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('No badges for this target profile.');
    });
  });
});
