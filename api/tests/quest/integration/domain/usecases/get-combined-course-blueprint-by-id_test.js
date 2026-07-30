import sinon from 'sinon';

import { COMBINED_COURSE_ITEM_TYPES, REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourseBlueprintForCreation } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForCreation.js';
import { REQUIREMENT_TYPES } from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Quest | Domain | UseCases | get-combined-course-blueprint-by-id', function () {
  let clock;
  const now = new Date('2022-11-28T12:00:00Z');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('should return a combined course blueprint for a given id', async function () {
    //given
    const { id: targetProfileId } = await databaseBuilder.factory.buildTargetProfile({ name: 'Mon profil cible' });

    const { id: rewardId, label: attestationLabel } = await databaseBuilder.factory.buildAttestation();

    const tube1Id = 'tubeId1';
    const tube2Id = 'tubeId2';
    const tube1Level = 3;
    const tube2Level = 5;
    const requirement1Threshold = 50;
    const requirement2Threshold = 60;
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
        {
          requirement_type: REQUIREMENT_TYPES.CAPPED_TUBES,
          data: {
            threshold: requirement1Threshold,
            cappedTubes: [{ level: tube1Level, tubeId: tube1Id }],
          },
        },
        {
          requirement_type: REQUIREMENT_TYPES.CAPPED_TUBES,
          data: {
            threshold: requirement2Threshold,
            cappedTubes: [{ level: tube2Level, tubeId: tube2Id }],
          },
        },
      ],
    });
    await databaseBuilder.factory.buildCombinedCourseBlueprint({
      id: 1,
      questId: quest.id,
    });

    const framework = await databaseBuilder.factory.learningContent.buildFramework();

    const thematic1 = await databaseBuilder.factory.learningContent.buildThematic({
      tubeIds: [tube1Id],
      competenceId: 'competenceIdA',
    });

    const competence1 = await databaseBuilder.factory.learningContent.buildCompetence({
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

    await databaseBuilder.commit();

    const expectedTube = domainBuilder.buildTube({
      id: tube1Id,
      competenceId: competence1.id,
      thematicId: thematic1.id,
    });
    const expectedThematic = domainBuilder.buildThematic({
      id: thematic1.id,
      competenceId: competence1.id,
      tubeIds: [tube1Id],
      tubes: [expectedTube],
    });
    const expectedCompetence = domainBuilder.buildCompetence({
      id: competence1.id,
      thematicIds: [thematic1.id],
      thematics: [expectedThematic],
      tubes: [expectedTube],
    });
    const expectedArea = domainBuilder.buildArea({
      id: 'area1',
      code: 'code Domaine A',
      name: 'name Domaine A',
      title: 'title FR Domaine A',
      color: 'color Domaine A',
      frameworkId: framework.id,
      competences: [expectedCompetence],
    });
    const expectedArea2 = domainBuilder.buildArea({
      ...expectedArea,
      competences: [expectedCompetence],
    });

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
      illustration: 'images/illustration.svg',
      createdAt: now,
      updatedAt: now,
      organizationIds: [],
      attestationLabel,
    });
    expect(combinedCourseBlueprintForCreation.content).to.deep.equal([
      { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: targetProfileId },
      { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: '9beb922f-4d8e-495d-9c85-0e7265ca78d6', shortId: 'e074af34' },
    ]);

    const { rewardRequirements } = combinedCourseBlueprintForCreation;
    expect(combinedCourseBlueprintForCreation.rewardRequirements).to.have.lengthOf(2);

    const [firstRequirement, secondRequirement] = rewardRequirements;
    expect(firstRequirement.id).to.equal('1-reward-requirement-0');
    expect(firstRequirement.cappedTubesThreshold).to.equal(requirement1Threshold);
    expect(firstRequirement.areas).to.have.lengthOf(1);
    expect(firstRequirement.areas[0].id).to.equal(expectedArea.id);
    expect(firstRequirement.areas[0].competences[0].id).to.equal(expectedCompetence.id);
    expect(firstRequirement.areas[0].competences[0].thematics[0].id).to.equal(expectedThematic.id);
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
    expect(secondRequirement.areas).to.have.lengthOf(1);
    expect(secondRequirement.areas[0].id).to.equal(expectedArea2.id);
    expect(secondRequirement.areas[0].competences[0].id).to.equal(expectedCompetence.id);
    expect(secondRequirement.areas[0].competences[0].thematics[0].id).to.equal(expectedThematic.id);
    const secondRequirementsTubes = secondRequirement.areas[0].competences[0].thematics[0].tubes;
    expect(secondRequirementsTubes).to.have.lengthOf(1);
    expect(secondRequirementsTubes[0]).to.deep.equal({
      id: tube2Id,
      level: tube2Level,
      name: 'name Tube A',
      practicalTitle: 'practicalTitle FR Tube A',
    });
  });

  it('should throw when no combined course blueprint is found for a given id', async function () {
    //when
    const error = await catchErr(usecases.getCombinedCourseBlueprintById)({ id: 1 });

    expect(error).to.be.instanceof(NotFoundError);
    expect(error.message).to.equal('Combined course blueprint not found');
  });
});
