import { COMPARISONS as CRITERION_PROPERTY_COMPARISONS } from '../../../../../src/quest/domain/models/CriterionProperty.js';
import { Eligibility } from '../../../../../src/quest/domain/models/Eligibility.js';
import {
  buildRequirement,
  CappedTubesRequirement,
  COMPARISONS,
  ComposedRequirement,
  ObjectRequirement,
  SkillProfileRequirement,
  TYPES,
} from '../../../../../src/quest/domain/models/Requirement.js';
import { Success } from '../../../../../src/quest/domain/models/Success.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Requirement ', function () {
  describe('Factory - buildRequirement', function () {
    context('when requirement_type is compose', function () {
      it('should build a ComposedRequirement', function () {
        // given
        const buildData = {
          requirement_type: TYPES.COMPOSE,
          comparison: COMPARISONS.ALL,
          data: [],
        };

        // when
        const requirement = buildRequirement(buildData);

        // then
        expect(requirement instanceof ComposedRequirement).to.be.true;
      });
    });

    context('when requirement_type is "organization"', function () {
      it('should build an ObjectRequirement', function () {
        // given
        const buildData = {
          requirement_type: TYPES.OBJECT.ORGANIZATION,
          comparison: COMPARISONS.ALL,
          data: {},
        };

        // when
        const requirement = buildRequirement(buildData);

        // then
        expect(requirement instanceof ObjectRequirement).to.be.true;
      });
    });

    context('when requirement_type is "organizationLearner"', function () {
      it('should build an ObjectRequirement', function () {
        // given
        const buildData = {
          requirement_type: TYPES.OBJECT.ORGANIZATION_LEARNER,
          comparison: COMPARISONS.ALL,
          data: {},
        };

        // when
        const requirement = buildRequirement(buildData);

        // then
        expect(requirement instanceof ObjectRequirement).to.be.true;
      });
    });

    context('when requirement_type is "campaignParticipations"', function () {
      it('should build an ObjectRequirement', function () {
        // given
        const buildData = {
          requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          comparison: COMPARISONS.ALL,
          data: {},
        };

        // when
        const requirement = buildRequirement(buildData);

        // then
        expect(requirement instanceof ObjectRequirement).to.be.true;
      });
    });

    context('when requirement_type is "skillProfile"', function () {
      it('should build an SkillProfileRequirement', function () {
        // given
        const buildData = {
          requirement_type: TYPES.SKILL_PROFILE,
          comparison: 'irrelevant',
          data: {},
        };

        // when
        const requirement = buildRequirement(buildData);

        // then
        expect(requirement instanceof SkillProfileRequirement).to.be.true;
      });
    });

    context('when requirement_type is "cappedTubes"', function () {
      it('should build an CappedTubesRequirement', function () {
        // given
        const buildData = {
          requirement_type: TYPES.CAPPED_TUBES,
          comparison: 'irrelevant',
          data: {},
        };

        // when
        const requirement = buildRequirement(buildData);

        // then
        expect(requirement instanceof CappedTubesRequirement).to.be.true;
      });
    });

    context('when requirement_type is unknown', function () {
      it('should throw an error', function () {
        // given
        const buildData = {
          requirement_type: 'yolo',
          comparison: COMPARISONS.ALL,
          data: {},
        };

        // when / then
        expect(() => buildRequirement(buildData)).to.throw('Unknown requirement_type "yolo"');
      });
    });
  });

  describe('ComposedRequirement', function () {
    describe('constructor', function () {
      it('should build the same instance whether we are passing through raw requirements or instanciated requirements', function () {
        // given
        const requirementA = new ComposedRequirement({
          comparison: COMPARISONS.ALL,
          data: [
            {
              requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
              data: {
                targetProfileId: {
                  data: 1,
                  comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                },
              },
              comparison: COMPARISONS.ONE_OF,
            },
            {
              requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
              data: {
                targetProfileId: {
                  data: 2,
                  comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                },
              },
              comparison: COMPARISONS.ALL,
            },
          ],
        });
        const requirementB = new ComposedRequirement({
          requirement_type: requirementA.requirement_type,
          comparison: requirementA.comparison,
          data: requirementA.data,
        });

        // when / then
        expect(requirementA.toDTO()).to.deep.equal(requirementB.toDTO());
      });
    });

    describe('isFulfilled', function () {
      describe('when comparison is ALL', function () {
        it('should return true if all requirements are met', function () {
          const requirement = new ComposedRequirement({
            comparison: COMPARISONS.ALL,
            data: [
              {
                requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 1,
                    comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                  },
                },
                comparison: COMPARISONS.ALL,
              },
              {
                requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 2,
                    comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                  },
                },
                comparison: COMPARISONS.ALL,
              },
            ],
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 1 }, { targetProfileId: 2 }],
          });

          expect(requirement.isFulfilled(eligibility)).to.be.true;
        });

        it('should return false if all requirements are not met', function () {
          const requirement = new ComposedRequirement({
            comparison: COMPARISONS.ALL,
            data: [
              {
                requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 1,
                    comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                  },
                },
                comparison: COMPARISONS.ALL,
              },
              {
                requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 2,
                    comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                  },
                },
                comparison: COMPARISONS.ALL,
              },
            ],
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 1 }, { targetProfileId: 3 }],
          });

          expect(requirement.isFulfilled(eligibility)).to.be.false;
        });
      });

      describe('when comparison is ONE_OF', function () {
        it('should return true if one of the requirements is met', function () {
          const requirement = new ComposedRequirement({
            comparison: COMPARISONS.ONE_OF,
            data: [
              {
                requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 1,
                    comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                  },
                },
                comparison: COMPARISONS.ALL,
              },
              {
                requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 2,
                    comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                  },
                },
                comparison: COMPARISONS.ALL,
              },
            ],
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 1 }],
          });

          expect(requirement.isFulfilled(eligibility)).to.be.true;
        });

        it('should return false if none of the requirements are met', function () {
          const requirement = new ComposedRequirement({
            comparison: COMPARISONS.ONE_OF,
            data: [
              {
                requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 1,
                    comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                  },
                },
                comparison: COMPARISONS.ALL,
              },
              {
                requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                data: {
                  targetProfileId: {
                    data: 2,
                    comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                  },
                },
                comparison: COMPARISONS.ALL,
              },
            ],
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 3 }],
          });

          expect(requirement.isFulfilled(eligibility)).to.be.false;
        });
      });
    });

    describe('toDTO', function () {
      it('should transform into a DTO the requirement recursively', function () {
        // given
        const rootRequirement = new ComposedRequirement({
          data: [
            {
              requirement_type: TYPES.OBJECT.ORGANIZATION,
              data: {
                keyA: {
                  data: 'valueA',
                  comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                },
              },
              comparison: COMPARISONS.ALL,
            },
            {
              requirement_type: TYPES.COMPOSE,
              data: [
                {
                  requirement_type: TYPES.OBJECT.ORGANIZATION_LEARNER,
                  data: {
                    keyB: {
                      data: 'valueB',
                      comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                    },
                  },
                  comparison: COMPARISONS.ONE_OF,
                },
                {
                  requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                  data: {
                    keyC: {
                      data: 'valueC',
                      comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                    },
                  },
                  comparison: COMPARISONS.ONE_OF,
                },
              ],
              comparison: COMPARISONS.ALL,
            },
          ],
          comparison: COMPARISONS.ALL,
        });

        // when
        const DTO = rootRequirement.toDTO();

        // then
        expect(DTO).to.deep.equal({
          requirement_type: TYPES.COMPOSE,
          data: [
            {
              requirement_type: TYPES.OBJECT.ORGANIZATION,
              data: {
                keyA: {
                  data: 'valueA',
                  comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                },
              },
              comparison: COMPARISONS.ALL,
            },
            {
              requirement_type: TYPES.COMPOSE,
              data: [
                {
                  requirement_type: TYPES.OBJECT.ORGANIZATION_LEARNER,
                  data: {
                    keyB: {
                      data: 'valueB',
                      comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                    },
                  },
                  comparison: COMPARISONS.ONE_OF,
                },
                {
                  requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
                  data: {
                    keyC: {
                      data: 'valueC',
                      comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
                    },
                  },
                  comparison: COMPARISONS.ONE_OF,
                },
              ],
              comparison: COMPARISONS.ALL,
            },
          ],
          comparison: COMPARISONS.ALL,
        });
      });
    });
  });

  describe('ObjectRequirement', function () {
    describe('constructor', function () {
      it('should build the same instance whether we are passing through raw criterion or instanciated criterion', function () {
        // given
        const requirementA = new ObjectRequirement({
          requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          comparison: COMPARISONS.ALL,
          data: {
            targetProfileId: {
              data: 1,
              comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
            },
          },
        });
        const requirementB = new ObjectRequirement({
          requirement_type: requirementA.requirement_type,
          comparison: requirementA.comparison,
          data: requirementA.data,
        });

        // when / then
        expect(requirementA.toDTO()).to.deep.equal(requirementB.toDTO());
      });
    });

    describe('isFulfilled', function () {
      describe('when dataInput attribute is not an array', function () {
        it('it should return true if criterion is valid', function () {
          const requirement = new ObjectRequirement({
            requirement_type: TYPES.OBJECT.ORGANIZATION,
            comparison: COMPARISONS.ALL,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
              },
            },
          });
          const eligibility = new Eligibility({
            organization: {
              type: 'SCO',
            },
          });

          expect(requirement.isFulfilled(eligibility)).to.be.true;
        });

        it('it should return false if criterion is not valid', function () {
          const requirement = new ObjectRequirement({
            requirement_type: TYPES.OBJECT.ORGANIZATION,
            comparison: COMPARISONS.ALL,
            data: {
              type: {
                data: 'SCO',
                comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
              },
            },
          });
          const eligibility = new Eligibility({
            organization: {
              type: 'PRO',
            },
          });

          expect(requirement.isFulfilled(eligibility)).to.be.false;
        });
      });

      describe('when dataInput attribute is an array', function () {
        it('it should return true if one of the dataInput item validate criterion', function () {
          const requirement = new ObjectRequirement({
            requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            comparison: COMPARISONS.ALL,
            data: {
              targetProfileId: {
                data: 1,
                comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
              },
            },
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 2 }, { targetProfileId: 1 }],
          });

          expect(requirement.isFulfilled(eligibility)).to.be.true;
        });

        it('it should return false if none of the dataInput item validate criterion', function () {
          const requirement = new ObjectRequirement({
            requirement_type: TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            comparison: COMPARISONS.ALL,
            data: {
              targetProfileId: {
                data: 3,
                comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
              },
            },
          });
          const eligibility = new Eligibility({
            campaignParticipations: [{ targetProfileId: 2 }, { targetProfileId: 1 }],
          });

          expect(requirement.isFulfilled(eligibility)).to.be.false;
        });
      });
    });

    describe('toDTO', function () {
      it('should transform into a DTO', function () {
        // given
        const requirement = new ObjectRequirement({
          requirement_type: TYPES.OBJECT.ORGANIZATION,
          data: {
            keyA: {
              data: 'valueA',
              comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
            },
          },
          comparison: COMPARISONS.ALL,
        });

        // when
        const DTO = requirement.toDTO();

        // then
        expect(DTO).to.deep.equal({
          requirement_type: TYPES.OBJECT.ORGANIZATION,
          data: {
            keyA: {
              data: 'valueA',
              comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
            },
          },
          comparison: COMPARISONS.ALL,
        });
      });
    });
  });

  describe('SkillProfileRequirement', function () {
    describe('isFulfilled', function () {
      context("when dataInput's masteryPercentage is below threshold", function () {
        it('should return false', function () {
          const requirement = new SkillProfileRequirement({
            data: {
              skillIds: ['skillB', 'skillA', 'skillC', 'skillE'],
              threshold: 51,
            },
          });
          const successWith50MasteryPercentage = new Success({
            knowledgeElements: [
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillA' },
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillB' },
              { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillC' },
              { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillD' },
            ],
            skills: [
              { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skillB', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skillC', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skillD', tubeId: 'tubeA', difficulty: 1 },
            ],
          });

          expect(requirement.isFulfilled(successWith50MasteryPercentage)).to.be.false;
        });
      });

      context("when dataInput's masteryPercentage is equal to threshold", function () {
        it('should return true', function () {
          const requirement = new SkillProfileRequirement({
            data: {
              skillIds: ['skillB', 'skillA', 'skillC', 'skillE'],
              threshold: 50,
            },
          });
          const successWith50MasteryPercentage = new Success({
            knowledgeElements: [
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillA' },
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillB' },
              { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillC' },
              { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillD' },
            ],
            skills: [
              { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skillB', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skillC', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skillD', tubeId: 'tubeA', difficulty: 1 },
            ],
          });

          expect(requirement.isFulfilled(successWith50MasteryPercentage)).to.be.true;
        });
      });

      context("when dataInput's masteryPercentage is above threshold", function () {
        it('should return true', function () {
          const requirement = new SkillProfileRequirement({
            data: {
              skillIds: ['skillB', 'skillA', 'skillC', 'skillE'],
              threshold: 49,
            },
          });
          const successWith50MasteryPercentage = new Success({
            knowledgeElements: [
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillA' },
              { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillB' },
              { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillC' },
              { status: KnowledgeElement.StatusType.INVALIDATED, skillId: 'skillD' },
            ],
            skills: [
              { id: 'skillA', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skillB', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skillC', tubeId: 'tubeA', difficulty: 1 },
              { id: 'skillD', tubeId: 'tubeA', difficulty: 1 },
            ],
          });

          expect(requirement.isFulfilled(successWith50MasteryPercentage)).to.be.true;
        });
      });
    });

    describe('toDTO', function () {
      it('should transform into a DTO', function () {
        // given
        const requirement = new SkillProfileRequirement({
          data: {
            skillIds: ['id1', 'id2'],
            threshold: 70,
          },
        });

        // when
        const DTO = requirement.toDTO();

        // then
        expect(DTO).to.deep.equal({
          requirement_type: TYPES.SKILL_PROFILE,
          data: {
            skillIds: ['id1', 'id2'],
            threshold: 70,
          },
        });
      });
    });
  });

  describe('CappedTubesRequirement', function () {
    describe('isFulfilled', function () {
      let successWith60MasteryPercentage;
      const cappedTubes = [
        { tubeId: 'tubeA', level: 2 },
        { tubeId: 'tubeB', level: 3 },
      ];

      beforeEach(function () {
        successWith60MasteryPercentage = new Success({
          knowledgeElements: [
            {
              status: KnowledgeElement.StatusType.VALIDATED,
              skillId: 'skill1tubeA_V1',
              createdAt: new Date('2025-03-17'),
            },
            {
              status: KnowledgeElement.StatusType.INVALIDATED,
              skillId: 'skill2tubeA',
              createdAt: new Date('2025-03-17'),
            },
            {
              status: KnowledgeElement.StatusType.VALIDATED,
              skillId: 'skill3tubeA',
              createdAt: new Date('2025-03-17'),
            },
            {
              status: KnowledgeElement.StatusType.VALIDATED,
              skillId: 'skill4tubeA',
              createdAt: new Date('2025-03-17'),
            },
            {
              status: KnowledgeElement.StatusType.VALIDATED,
              skillId: 'skill1tubeB',
              createdAt: new Date('2025-03-17'),
            },
            {
              status: KnowledgeElement.StatusType.VALIDATED,
              skillId: 'skill2tubeB',
              createdAt: new Date('2025-03-17'),
            },
            {
              status: KnowledgeElement.StatusType.INVALIDATED,
              skillId: 'skill3tubeB',
              createdAt: new Date('2025-03-17'),
            },
            { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillTubeC', createdAt: new Date('2025-03-17') },
            { status: KnowledgeElement.StatusType.VALIDATED, skillId: 'skillTubeD', createdAt: new Date('2025-03-17') },
          ],
          campaignSkills: [
            { id: 'skill1tubeA_V1', tubeId: 'tubeA', difficulty: 1 },
            { id: 'skill2tubeA', tubeId: 'tubeA', difficulty: 2 },
            { id: 'skill3tubeA', tubeId: 'tubeA', difficulty: 3 },
            { id: 'skill4tubeA', tubeId: 'tubeA', difficulty: 4 },
            { id: 'skill1tubeB', tubeId: 'tubeB', difficulty: 1 },
            { id: 'skill2tubeB', tubeId: 'tubeB', difficulty: 2 },
            { id: 'skill3tubeB', tubeId: 'tubeB', difficulty: 3 },
            { id: 'skillTubeC', tubeId: 'tubeC', difficulty: 1 },
            { id: 'skillTubeD', tubeId: 'tubeD', difficulty: 1 },
          ],
        });
      });
      context(
        'when two skills exist for a tube and a difficulty compute fulfillement taking in account only most recent knowledge element',
        function () {
          it('return true', function () {
            // given
            const success = new Success({
              knowledgeElements: [
                ...successWith60MasteryPercentage.knowledgeElements,
                {
                  status: KnowledgeElement.StatusType.INVALIDATED,
                  skillId: 'skill1tubeA_V2',
                  createdAt: new Date('2024-06-10'),
                },
              ],
              campaignSkills: [
                ...successWith60MasteryPercentage.campaignSkills,
                { id: 'skill1tubeA_V2', tubeId: 'tubeA', difficulty: 1 },
              ],
            });
            const requirement = new CappedTubesRequirement({
              data: {
                cappedTubes,
                threshold: 60,
              },
            });

            // when
            const isFulfilled = requirement.isFulfilled(success);

            // then
            expect(isFulfilled).to.be.true;
          });

          it('return false', function () {
            // given
            const success = new Success({
              knowledgeElements: [
                ...successWith60MasteryPercentage.knowledgeElements,
                {
                  status: KnowledgeElement.StatusType.INVALIDATED,
                  skillId: 'skill1tubeA_V2',
                  createdAt: new Date('2025-12-24'),
                },
              ],
              campaignSkills: [
                ...successWith60MasteryPercentage.campaignSkills,
                { id: 'skill1tubeA_V2', tubeId: 'tubeA', difficulty: 1 },
              ],
            });
            const requirement = new CappedTubesRequirement({
              data: {
                cappedTubes,
                threshold: 60,
              },
            });

            // when
            const isFulfilled = requirement.isFulfilled(success);

            // then
            expect(isFulfilled).to.be.false;
          });
        },
      );

      context("when dataInput's masteryPercentage is below threshold", function () {
        it('should return false', function () {
          // given
          const requirement = new CappedTubesRequirement({
            data: {
              cappedTubes,
              threshold: 61,
            },
          });

          // when
          const isFulfilled = requirement.isFulfilled(successWith60MasteryPercentage);

          // then
          expect(isFulfilled).to.be.false;
        });
      });

      context("when dataInput's masteryPercentage is equal to threshold", function () {
        it('should return true', function () {
          // given
          const requirement = new CappedTubesRequirement({
            data: {
              cappedTubes,
              threshold: 60,
            },
          });

          // when
          const isFulfilled = requirement.isFulfilled(successWith60MasteryPercentage);

          // then
          expect(isFulfilled).to.be.true;
        });
      });

      context("when dataInput's masteryPercentage is above threshold", function () {
        it('should return true', function () {
          // given
          const requirement = new CappedTubesRequirement({
            data: {
              cappedTubes,
              threshold: 59,
            },
          });

          // when
          const isFulfilled = requirement.isFulfilled(successWith60MasteryPercentage);

          // then
          expect(isFulfilled).to.be.true;
        });
      });
    });

    describe('toDTO', function () {
      it('should transform into a DTO', function () {
        // given
        const requirement = new CappedTubesRequirement({
          data: {
            cappedTubes: [
              { tubeId: 'tubeA', level: 2 },
              { tubeId: 'tubeB', level: 5 },
            ],
            threshold: 70,
          },
        });

        // when
        const DTO = requirement.toDTO();

        // then
        expect(DTO).to.deep.equal({
          requirement_type: TYPES.CAPPED_TUBES,
          data: {
            cappedTubes: [
              { tubeId: 'tubeA', level: 2 },
              { tubeId: 'tubeB', level: 5 },
            ],
            threshold: 70,
          },
        });
      });
    });
  });
});
