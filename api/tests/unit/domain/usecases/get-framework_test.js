const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-framework', function () {
  let expectedChallengeResult,
    expectedSkillResult,
    expectedTubesResult,
    expectedThematicsResult,
    expectedAreasResult,
    challengeRepository,
    skillRepository,
    tubeRepository,
    thematicRepository,
    areaRepository;

  beforeEach(function () {
    expectedChallengeResult = [{ id: 'challengeId1', responsive: '' }];
    expectedSkillResult = [{ id: 'skillId1' }];
    expectedTubesResult = [{ id: 'tubeId1' }];
    expectedThematicsResult = [{ id: 'thematicId', tubeIds: [{ id: 'tubeId1' }] }];
    expectedAreasResult = [{ id: 'areaId1', competences: [{ id: 'competenceId1' }] }];

    challengeRepository = {
      findValidatedPrototypeBySkillId: sinon.stub().resolves(expectedChallengeResult),
    };

    skillRepository = {
      findActiveByTubeId: sinon.stub().resolves(expectedSkillResult),
    };

    tubeRepository = {
      findActiveByRecordIds: sinon.stub().resolves(expectedTubesResult),
      findActivesFromPixFramework: sinon.stub().resolves(expectedTubesResult),
    };

    thematicRepository = {
      findByCompetenceId: sinon.stub().resolves().returns(expectedThematicsResult),
    };

    areaRepository = {
      findByFrameworkId: sinon.stub().resolves().returns(expectedAreasResult),
    };
  });

  it('should get the framework', async function () {
    // when
    const response = await usecases.getFramework({
      challengeRepository,
      skillRepository,
      tubeRepository,
      thematicRepository,
      areaRepository,
    });

    expect(response).to.deep.equal({
      tubes: expectedTubesResult,
      thematics: expectedThematicsResult,
      areas: expectedAreasResult,
    });
    expect(challengeRepository.findValidatedPrototypeBySkillId).to.have.been.called;
    expect(skillRepository.findActiveByTubeId).to.have.been.called;
    expect(tubeRepository.findActiveByRecordIds).to.have.been.called;
    expect(thematicRepository.findByCompetenceId).to.have.been.called;
    expect(areaRepository.findByFrameworkId).to.have.been.called;
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    {
      challengeResult: [
        {
          id: 'challengeId1',
          responsive: 'Tablette/Smartphone',
        },
      ],
      expectedResult: {
        mobile: true,
        tablet: true,
      },
    },
    {
      challengeResult: [
        {
          id: 'challengeId1',
          responsive: 'Tablette/Smartphone',
        },
        {
          id: 'challengeId2',
          responsive: 'Tablette',
        },
      ],
      expectedResult: {
        mobile: false,
        tablet: true,
      },
    },
    {
      challengeResult: [
        {
          id: 'challengeId1',
          responsive: 'Tablette/Smartphone',
        },
        {
          id: 'challengeId2',
          responsive: 'Smartphone',
        },
      ],
      expectedResult: {
        mobile: true,
        tablet: false,
      },
    },
    {
      challengeResult: [
        {
          id: 'challengeId1',
          responsive: 'Tablette/Smartphone',
        },
        {
          id: 'challengeId2',
          responsive: 'Non',
        },
      ],
      expectedResult: {
        mobile: false,
        tablet: false,
      },
    },
    {
      challengeResult: [],
      expectedResult: {
        mobile: false,
        tablet: false,
      },
    },
    {
      challengeResult: [
        {
          id: 'challengeId2',
        },
      ],
      expectedResult: {
        mobile: false,
        tablet: false,
      },
    },
  ].forEach(({ challengeResult, expectedResult }) => {
    it(`should get list of tube with responsive status when its challenges have responsive status=${challengeResult.responsive}`, async function () {
      // given
      challengeRepository = {
        findValidatedPrototypeBySkillId: sinon.stub().resolves(challengeResult),
      };

      // when
      const { tubes } = await usecases.getFramework({
        challengeRepository,
        skillRepository,
        tubeRepository,
        thematicRepository,
        areaRepository,
      });

      // then
      expect(tubes[0].mobile).to.equal(expectedResult.mobile);
      expect(tubes[0].tablet).to.equal(expectedResult.tablet);
    });
  });
});
