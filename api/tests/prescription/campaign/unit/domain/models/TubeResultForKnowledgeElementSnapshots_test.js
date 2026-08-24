import { TubeResultForKnowledgeElementSnapshots } from '../../../../../../src/prescription/campaign/domain/models/TubeResultForKnowledgeElementSnapshots.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | TubeResultForKnowledgeElementSnapshots', function () {
  let competence, tube, knowledgeElementSnapshots;

  describe('Constructor', function () {
    beforeEach(function () {
      const skill1 = domainBuilder.buildSkill({
        id: 'recSkillWeb1',
        tubeId: 'tube1',
        difficulty: 1,
      });
      const skill2 = domainBuilder.buildSkill({
        id: 'recSkillWeb2',
        tubeId: 'tube1',
        difficulty: 2,
      });
      tube = domainBuilder.buildTube({
        id: 'tube1',
        competenceId: 'competence1',
        skills: [skill1, skill2],
        practicalTitle: 'tube 1',
        practicalDescription: 'tube 1 description',
      });

      const unusedSkill = domainBuilder.buildSkill({
        id: 'recSkillUrl1',
        tubeId: 'tube2',
        difficulty: 3,
      });
      const unusedTube = domainBuilder.buildTube({
        id: 'tube2',
        competenceId: 'competence1',
        skills: [unusedSkill],
        practicalTitle: 'tube 2',
        practicalDescription: 'tube 2 description',
      });

      competence = domainBuilder.buildCompetence({
        id: 'competence1',
        areaId: 'recArea1',
        tubes: [tube, unusedTube],
        name: 'compétence 1',
        description: 'description compétence 1',
      });

      const user1ke1 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recSkillWeb1',
        userId: 1,
      });
      const user1ke2 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
        skillId: 'recSkillWeb2',
        userId: 1,
      });

      const user2ke1 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recSkillWeb1',
        userId: 2,
      });

      const user2ke2 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recSkillUrl1',
        userId: 2,
      });

      knowledgeElementSnapshots = [
        KnowledgeElement.toLatestUniqNonResetCollection([user1ke1, user1ke2]),
        KnowledgeElement.toLatestUniqNonResetCollection([user2ke1, user2ke2]),
      ];
    });

    describe('when there is participations', function () {
      it('should instanciate a model with correct data', function () {
        //when
        const tubeResult = new TubeResultForKnowledgeElementSnapshots({
          tube,
          competence,
        });

        tubeResult.addKnowledgeElementSnapshots(knowledgeElementSnapshots);
        //then
        expect(tubeResult.id).equal(tube.id);
        expect(tubeResult.competenceId).equal(tube.competenceId);
        expect(tubeResult.title).equal(tube.practicalTitle);
        expect(tubeResult.description).equal(tube.practicalDescription);
        expect(tubeResult.maxLevel).equal(2);
        // mean level = user1 (level 1: ok, level 2: ko), user2: (level 1: ok)
        expect(tubeResult.meanLevel).equal(1);
        expect(tubeResult.competenceName).equal(competence.name);
      });
    });

    describe('when there is no participation', function () {
      it('should instanciate a model with correct data', function () {
        //when
        const tubeResult = new TubeResultForKnowledgeElementSnapshots({
          tube,
          competence,
        });

        //then
        expect(tubeResult.id).equal(tube.id);
        expect(tubeResult.competenceId).equal(tube.competenceId);
        expect(tubeResult.title).equal(tube.practicalTitle);
        expect(tubeResult.description).equal(tube.practicalDescription);
        expect(tubeResult.maxLevel).equal(2);
        expect(tubeResult.meanLevel).equal(0);
        expect(tubeResult.competenceName).equal(competence.name);
      });
    });
  });
});
