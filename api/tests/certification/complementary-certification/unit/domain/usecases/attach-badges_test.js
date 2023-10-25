import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { attachBadges } from '../../../../../../src/certification/complementary-certification/domain/usecases/attach-badges.js';
import { MissingAttributesError, NotFoundError } from '../../../../../../lib/domain/errors.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { InvalidBadgeLevelError } from '../../../../../../src/certification/complementary-certification/domain/errors.js';

describe('Unit | UseCase | attach-badges', function () {
  let complementaryCertificationForTargetProfileAttachmentRepository, complementaryCertificationBadgesRepository;
  let clock;
  const now = new Date('2023-02-02');

  beforeEach(function () {
    complementaryCertificationForTargetProfileAttachmentRepository = {
      getById: sinon.stub(),
    };
    complementaryCertificationBadgesRepository = {
      findAttachableBadgesByIds: sinon.stub(),
    };
    clock = sinon.useFakeTimers(now);
  });
  afterEach(function () {
    clock.restore();
  });

  context('when levels checks are not ok', function () {
    context('when there is no complementary certification badges to attach', function () {
      it('should throw InvalidBadgeLevelError', async function () {
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
    });

    context('when there is a level below 1', function () {
      it('should throw InvalidBadgeLevelError', async function () {
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
    });

    context('when there is a level above the number of badges (4 badges, max level = 4)', function () {
      it('should throw InvalidBadgeLevelError', async function () {
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
    });

    context('when there is a badge without a level', function () {
      it('should throw InvalidBadgeLevelError', async function () {
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
    });

    context('when levels are not uniq', function () {
      it('should throw InvalidBadgeLevelError', async function () {
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
  });

  context('when complementary certification has external jury and one required attributes is missing', function () {
    it('should return MissingAttributesError', async function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertificationForTargetProfileAttachment({
        id: 123,
        hasExternalJury: true,
      });
      complementaryCertificationBadgesRepository.findAttachableBadgesByIds.resolves([{ badgeId: 1 }, { badgeId: 2 }]);

      // when
      const error = await catchErr(attachBadges)({
        complementaryCertificationBadgesToAttachDTO: [
          { badgeId: 1, level: 1, certificateMessage: 'message', temporaryCertificateMessage: 'temporary message' },
          { badgeId: 2, level: 2, certificateMessage: null, temporaryCertificateMessage: 'temporary message' },
        ],
        complementaryCertification,
        complementaryCertificationForTargetProfileAttachmentRepository,
        complementaryCertificationBadgesRepository,
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
          complementaryCertificationBadgesRepository.findAttachableBadgesByIds.resolves(assessment.resolve);

          // when
          const error = await catchErr(attachBadges)({
            complementaryCertificationId: 12,
            complementaryCertificationBadgesToAttachDTO: [
              { badgeId: 1, level: 1 },
              { badgeId: 2, level: 2 },
            ],
            complementaryCertificationBadgesRepository,
          });

          // then
          expect(error).to.be.instanceOf(NotFoundError);
          expect(error.message).to.equal('One or several badges are not attachable.');
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

        const complementaryCertification = domainBuilder.buildComplementaryCertificationForTargetProfileAttachment({
          id: 123,
          hasExternalJury: false,
        });
        const complementaryCertificationBadgesRepository = {
          attach: sinon.stub().resolves(),
          detachByIds: sinon.stub(),
          getAllIdsByTargetProfileId: sinon.stub(),
          findAttachableBadgesByIds: sinon.stub().resolves([badge1, badge2]),
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
          complementaryCertification,
          complementaryCertificationForTargetProfileAttachmentRepository,
          complementaryCertificationBadgesRepository,
        });

        // then
        expect(complementaryCertificationBadgesRepository.detachByIds).to.have.been.calledWithExactly({
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

        const complementaryCertification = domainBuilder.buildComplementaryCertificationForTargetProfileAttachment({
          id: 123,
          hasExternalJury: false,
        });
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
          findAttachableBadgesByIds: sinon.stub().resolves([badge1]),
        };

        // when
        await attachBadges({
          userId: 1234,
          complementaryCertificationBadgesToAttachDTO: [complementaryCertificationBadge],
          targetProfileIdToDetach: 456,
          complementaryCertification,
          complementaryCertificationForTargetProfileAttachmentRepository,
          complementaryCertificationBadgesRepository,
        });

        // then
        const newComplementaryCertificationBadge = domainBuilder.buildBadgeToAttach({
          ...complementaryCertificationBadge,
          complementaryCertificationId: 123,
          createdBy: 1234,
        });
        expect(complementaryCertificationBadgesRepository.attach).to.have.been.calledWithExactly({
          complementaryCertificationBadges: [newComplementaryCertificationBadge],
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

      const complementaryCertification = domainBuilder.buildComplementaryCertificationForTargetProfileAttachment({
        id: 123,
        hasExternalJury: false,
      });
      const complementaryCertificationBadgesRepository = {
        attach: sinon.stub().resolves(),
        detachByIds: sinon.stub(),
        getAllIdsByTargetProfileId: sinon.stub(),
        findAttachableBadgesByIds: sinon.stub().resolves([badge1, badge2]),
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
        complementaryCertification,
        BadgeToAttachValidator,
        complementaryCertificationForTargetProfileAttachmentRepository,
        complementaryCertificationBadgesRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('No badges for this target profile.');
    });
  });
});
