const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-framework-areas', function () {
  let expectedChallengeResult,
    expectedTubesResult,
    expectedThematicsResult,
    expectedAreasResult,
    challengeRepository,
    tubeRepository,
    thematicRepository,
    areaRepository;

  beforeEach(function () {
    expectedChallengeResult = [{ id: 'challengeId1', responsive: '', skill: { tubeId: 'tubeId1' } }];
    expectedTubesResult = [{ id: 'tubeId1' }];
    expectedThematicsResult = [{ id: 'thematicId', tubeIds: ['tubeId1'] }];
    expectedAreasResult = [{ id: 'areaId1', competences: [{ id: 'competenceId1' }] }];

    challengeRepository = {
      findValidatedPrototype: sinon.stub().resolves(expectedChallengeResult),
    };

    tubeRepository = {
      findActiveByRecordIds: sinon.stub().resolves(expectedTubesResult),
    };

    thematicRepository = {
      findByCompetenceIds: sinon.stub().resolves().returns(expectedThematicsResult),
    };

    areaRepository = {
      findByFrameworkIdWithCompetences: sinon.stub().resolves().returns(expectedAreasResult),
    };
  });

  it('should get the framework', async function () {
    // when
    const response = await usecases.getFrameworkAreas({
      frameworkId: 'frameworkId',
      locale: 'locale',
      challengeRepository,
      tubeRepository,
      thematicRepository,
      areaRepository,
    });

    expect(response).to.deep.equal({
      tubes: expectedTubesResult,
      thematics: expectedThematicsResult,
      areas: expectedAreasResult,
    });
    expect(challengeRepository.findValidatedPrototype).to.have.been.calledWithExactly();
    expect(tubeRepository.findActiveByRecordIds).to.have.been.calledWith(['tubeId1'], 'locale');
    expect(thematicRepository.findByCompetenceIds).to.have.been.calledWith(['competenceId1']);
    expect(areaRepository.findByFrameworkIdWithCompetences).to.have.been.calledWithExactly('frameworkId');
  });

  /* eslint-disable mocha/no-setup-in-describe */
  [
    {
      challengeResult: [
        {
          id: 'challengeId1',
          responsive: 'Tablette/Smartphone',
          skill: { tubeId: 'tubeId1' },
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
          skill: { tubeId: 'tubeId1' },
        },
        {
          id: 'challengeId2',
          responsive: 'Tablette',
          skill: { tubeId: 'tubeId1' },
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
          skill: { tubeId: 'tubeId1' },
        },
        {
          id: 'challengeId2',
          responsive: 'Smartphone',
          skill: { tubeId: 'tubeId1' },
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
          skill: { tubeId: 'tubeId1' },
        },
        {
          id: 'challengeId2',
          responsive: 'Non',
          skill: { tubeId: 'tubeId1' },
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
          id: 'challengeId1',
          responsive: 'Tablette/Smartphone',
          skill: { tubeId: 'tubeId2' },
        },
      ],
      expectedResult: {
        mobile: false,
        tablet: false,
      },
    },
  ].forEach(({ challengeResult, expectedResult }) => {
    context(
      `when challenges have responsive=${challengeResult.map(
        ({ responsive }) => `${responsive}`
      )} and tubeId=${challengeResult.map(({ skill: { tubeId } }) => tubeId)}`,
      function () {
        it(`should return a tube with mobile=${expectedResult.mobile} and tablet=${expectedResult.tablet}`, async function () {
          // given
          challengeRepository = {
            findValidatedPrototype: sinon.stub().resolves(challengeResult),
          };

          // when
          const { tubes } = await usecases.getFrameworkAreas({
            challengeRepository,
            tubeRepository,
            thematicRepository,
            areaRepository,
          });

          // then
          expect(tubes[0].mobile).to.equal(expectedResult.mobile);
          expect(tubes[0].tablet).to.equal(expectedResult.tablet);
        });
      }
    );
  });
  /* eslint-enable mocha/no-setup-in-describe */
});
