import { copyTargetProfileBadges } from '../../../../lib/domain/usecases/copy-target-profile-badges.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | copy-badges', function () {
  let badgeRepositoryStub;
  let badgeCriteriaRepositoryStub;

  beforeEach(function () {
    badgeRepositoryStub = {
      findAllByTargetProfileId: sinon.stub(),
      save: sinon.stub(),
    };

    badgeCriteriaRepositoryStub = {
      findAllByBadgeId: sinon.stub(),
      save: sinon.stub(),
    };
  });

  it('should copy target profile badges', async function () {
    // given

    const originTargetProfileId = Symbol('originTargetProfileId');
    const destinationTargetProfileId = Symbol('destinationTargetProfileId');
    const badge1 = domainBuilder.buildBadge({ id: 1, key: 'FIRST_KEY' });
    const badge2 = domainBuilder.buildBadge({ id: 2, key: 'SECOND_KEY' });

    const expectedBadge1 = domainBuilder.buildBadge({ id: undefined, key: '[COPIE]_FIRST_KEY' });
    const expectedBadge2 = domainBuilder.buildBadge({ id: undefined, key: '[COPIE]_SECOND_KEY' });

    const badges = [badge1, badge2];

    badgeRepositoryStub.findAllByTargetProfileId.withArgs(originTargetProfileId).resolves(badges);
    badgeRepositoryStub.save.resolves({ ...expectedBadge1, id: 3 });
    badgeRepositoryStub.save.resolves({ ...expectedBadge1, id: 4 });

    const badgeCriteria = [
      domainBuilder.buildBadgeCriterion({ id: 1, badgeId: badge1.id }),
      domainBuilder.buildBadgeCriterion({ id: 2, badgeId: badge2.id }),
    ];
    badgeCriteriaRepositoryStub.findAllByBadgeId.withArgs(badge1.id).resolves(badgeCriteria);
    badgeCriteriaRepositoryStub.findAllByBadgeId.withArgs(badge2.id).resolves(badgeCriteria);

    badgeCriteriaRepositoryStub.save
      .withArgs({
        badgeCriterion: {
          ...badgeCriteria[0],
          badgeId: expectedBadge1.id,
        },
      })
      .resolves();

    badgeCriteriaRepositoryStub.save
      .withArgs({
        badgeCriterion: {
          ...badgeCriteria[1],
          badgeId: expectedBadge2.id,
        },
      })
      .resolves();

    // when
    await copyTargetProfileBadges({
      originTargetProfileId,
      destinationTargetProfileId,
      badgeRepository: badgeRepositoryStub,
      badgeCriteriaRepository: badgeCriteriaRepositoryStub,
    });

    expect(badgeRepositoryStub.findAllByTargetProfileId).to.have.been.calledOnce;
    expect(badgeRepositoryStub.save).to.have.been.calledTwice;
    expect(badgeCriteriaRepositoryStub.save).to.have.been.callCount(4);
    expect(badgeCriteriaRepositoryStub.findAllByBadgeId).to.have.been.callCount(2);
  });
});
