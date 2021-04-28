const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const BadgeWithLearningContent = require('../../../../lib/domain/models/BadgeWithLearningContent');

describe('Unit | UseCase | get-badge-details', () => {

  it('should get badge details', async () => {
    // given
    const badge = {
      badgePartnerCompetences: [
        {
          skillIds: [1, 2],
        },
      ],
    };
    const badgeId = Symbol('badge id');

    const skills = [
      { tubeName: '@toto' },
    ];
    const tubes = [];
    const locale = 'fr-fr';
    const expectedResult = new BadgeWithLearningContent({
      skills,
      badge,
      tubes,
    });

    const badgeRepository = {
      get: sinon.stub(),
    };
    badgeRepository.get.resolves(badge);

    const skillRepository = {
      findOperativeByIds: sinon.stub(),
    };
    skillRepository.findOperativeByIds.resolves(skills);

    const tubeRepository = {
      findByNames: sinon.stub(),
    };
    tubeRepository.findByNames.resolves(tubes);

    // when
    const response = await usecases.getBadgeDetails({
      badgeId,
      badgeRepository,
      skillRepository,
      tubeRepository,
    });

    // then
    expect(response).to.deep.equal(expectedResult);
    expect(badgeRepository.get).to.has.been.calledWith(badgeId);
    expect(skillRepository.findOperativeByIds).to.has.been.calledWith([1, 2]);
    expect(tubeRepository.findByNames).to.has.been.calledWith({ tubeNames: ['@toto'], locale });
  });
});
