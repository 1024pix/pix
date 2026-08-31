import { expect } from 'chai';
import sinon from 'sinon';

import { COMBINED_COURSE_ITEM_TYPES, REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourseBlueprintForCreation } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForCreation.js';
import { REQUIREMENT_TYPES } from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Quest | Domain | UseCases | get-combined-course-blueprint-by-id', function () {
  const now = new Date('2022-11-28T12:00:00Z');

  beforeEach(async function () {
    sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  it('should return a combined course blueprint for a given id', async function () {
    //given
    const { id: targetProfileId } = await databaseBuilder.factory.buildTargetProfile({ name: 'Mon profil cible' });

    const { id: rewardId, label: attestationLabel } = await databaseBuilder.factory.buildAttestation();

    const quest = databaseBuilder.factory.buildQuest({
      rewardType: REWARD_TYPES.ATTESTATION,
      rewardId,
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          targetProfileId,
        }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          moduleId: '9beb922f-4d8e-495d-9c85-0e7265ca78d6',
        }).toDTO(),
      ],
    });
    await databaseBuilder.factory.buildCombinedCourseBlueprint({
      id: 1,
      questId: quest.id,
    });
    await databaseBuilder.commit();

    //when
    const combinedCourseBlueprintForCreation = await usecases.getCombinedCourseBlueprintById({
      id: 1,
    });

    //then
    expect(combinedCourseBlueprintForCreation).to.be.instanceOf(CombinedCourseBlueprintForCreation);
    expect(combinedCourseBlueprintForCreation).deep.contain({
      id: 1,
      name: 'Mon parcours combiné',
      internalName: 'Mon schéma de parcours combiné',
      description: 'Le but de ma quête',
      illustration: 'http://example.pix/images/illustration.svg',
      createdAt: now,
      updatedAt: now,
      organizationIds: [],
      attestationLabel,
    });
    expect(combinedCourseBlueprintForCreation.content).to.deep.equal([
      { type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: targetProfileId },
      { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: '9beb922f-4d8e-495d-9c85-0e7265ca78d6', shortId: 'e074af34' },
    ]);
  });

  it('should return a combined course blueprint with correct rewardRequirements', async function () {
    //given
    const { id: rewardId } = await databaseBuilder.factory.buildAttestation();

    const tube1Id = 'tubeId1';
    const tube2Id = 'tubeId2';
    const tube3Id = 'tubeId3';
    const tube1Level = 3;
    const tube2Level = 5;
    const tube3Level = 6;
    const requirement1Threshold = 50;
    const requirement2Threshold = 60;
    const quest = databaseBuilder.factory.buildQuest({
      rewardType: REWARD_TYPES.ATTESTATION,
      rewardId,
      successRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.CAPPED_TUBES,
          data: {
            name: 'requirements group name 1',
            threshold: requirement1Threshold,
            cappedTubes: [{ level: tube1Level, tubeId: tube1Id }],
          },
        },
        {
          requirement_type: REQUIREMENT_TYPES.CAPPED_TUBES,
          data: {
            name: 'requirements group name 2',
            threshold: requirement2Threshold,
            cappedTubes: [
              { level: tube2Level, tubeId: tube2Id },
              { level: tube3Level, tubeId: tube3Id },
            ],
          },
        },
      ],
    });
    await databaseBuilder.factory.buildCombinedCourseBlueprint({
      id: 1,
      questId: quest.id,
    });

    // build first framework, with tubes 1 & 2
    const framework = await databaseBuilder.factory.learningContent.buildFramework({ id: 'framework1' });
    const thematic1 = await databaseBuilder.factory.learningContent.buildThematic({
      id: 'thematic1',
      tubeIds: [tube1Id, tube2Id],
      competenceId: 'competence1',
    });
    const competence1 = await databaseBuilder.factory.learningContent.buildCompetence({
      id: 'competence1',
      areaId: 'area1',
      thematicIds: [thematic1.id],
    });
    await databaseBuilder.factory.learningContent.buildArea({
      id: 'area1',
      competenceIds: [competence1.id],
      frameworkId: framework.id,
    });
    await databaseBuilder.factory.learningContent.buildTube({
      id: tube1Id,
      competenceId: competence1.id,
      thematicId: thematic1.id,
    });
    await databaseBuilder.factory.learningContent.buildTube({
      id: tube2Id,
      competenceId: competence1.id,
      thematicId: thematic1.id,
    });

    // build second framework, with tube 3
    const framework2 = await databaseBuilder.factory.learningContent.buildFramework({ id: 'framework2' });
    const thematic2 = await databaseBuilder.factory.learningContent.buildThematic({
      id: 'thematic2',
      tubeIds: [tube3Id],
      competenceId: 'competence2',
    });
    const competence2 = await databaseBuilder.factory.learningContent.buildCompetence({
      id: 'competence2',
      areaId: 'area2',
      thematicIds: [thematic2.id],
    });
    await databaseBuilder.factory.learningContent.buildArea({
      id: 'area2',
      competenceIds: [competence2.id],
      frameworkId: framework2.id,
    });
    await databaseBuilder.factory.learningContent.buildTube({
      id: tube3Id,
      competenceId: competence2.id,
      thematicId: thematic2.id,
    });

    await databaseBuilder.commit();

    //when
    const combinedCourseBlueprintForCreation = await usecases.getCombinedCourseBlueprintById({
      id: 1,
    });

    //then
    expect(combinedCourseBlueprintForCreation).to.be.instanceOf(CombinedCourseBlueprintForCreation);

    const { rewardRequirements } = combinedCourseBlueprintForCreation;
    expect(combinedCourseBlueprintForCreation.rewardRequirements).to.have.lengthOf(2);

    const [firstRequirement, secondRequirement] = rewardRequirements;
    expect(firstRequirement.id).to.equal('1-reward-requirement-0');
    expect(firstRequirement.cappedTubesThreshold).to.equal(requirement1Threshold);
    expect(firstRequirement.name).to.equal('requirements group name 1');
    const firstRequirementsTubes = firstRequirement.areas[0].competences[0].thematics[0].tubes;
    expect(firstRequirementsTubes).to.have.lengthOf(1);
    expect(firstRequirementsTubes[0]).to.deep.equal({
      id: tube1Id,
      level: tube1Level,
      name: 'name Tube A',
      practicalTitle: 'practicalTitle FR Tube A',
    });

    expect(secondRequirement.id).to.equal('1-reward-requirement-1');
    expect(secondRequirement.cappedTubesThreshold).to.equal(requirement2Threshold);
    expect(secondRequirement.name).to.equal('requirements group name 2');
    const secondRequirementAreas = secondRequirement.areas;
    expect(secondRequirementAreas).to.have.lengthOf(2);
    const tubesFromArea1 = secondRequirementAreas[0].competences[0].thematics[0].tubes;
    expect(tubesFromArea1).to.deep.equal([
      { id: tube2Id, level: tube2Level, name: 'name Tube A', practicalTitle: 'practicalTitle FR Tube A' },
    ]);
    const tubesFromArea2 = secondRequirementAreas[1].competences[0].thematics[0].tubes;
    expect(tubesFromArea2).to.deep.equal([
      { id: tube3Id, level: tube3Level, name: 'name Tube A', practicalTitle: 'practicalTitle FR Tube A' },
    ]);
  });

  it('should throw when no combined course blueprint is found for a given id', async function () {
    //when
    const error = await catchErr(usecases.getCombinedCourseBlueprintById)({ id: 1 });

    expect(error).to.be.instanceof(NotFoundError);
    expect(error.message).to.equal('Combined course blueprint not found');
  });
});
