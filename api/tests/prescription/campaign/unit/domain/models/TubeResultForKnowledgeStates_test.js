import { expect } from 'chai';

import { TubeResultForKnowledgeStates } from '../../../../../../src/prescription/campaign/domain/models/TubeResultForKnowledgeStates.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | TubeResultForKnowledgeStates', function () {
  let competence, area, tube, knowledgeStates;

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

      // user1 : niveau 1 réussi, niveau 2 raté — user2 : niveau 1 réussi, et un
      // autre tube qui ne compte pas ici.
      knowledgeStates = [
        domainBuilder.buildKnowledgeState({
          tubes: [{ tubeId: 'tube1', floor: 1, ceiling: 2, directLevels: [1, 2] }],
        }),
        domainBuilder.buildKnowledgeState({
          tubes: [
            { tubeId: 'tube1', floor: 1, ceiling: null, directLevels: [1] },
            { tubeId: 'tube2', floor: 3, ceiling: null, directLevels: [3] },
          ],
        }),
      ];
    });

    describe('when there is participations', function () {
      it('should instanciate a model with correct data', function () {
        //when
        const tubeResult = new TubeResultForKnowledgeStates({
          tube,
          competence,
          area,
        });

        tubeResult.addKnowledgeStates(knowledgeStates);
        //then
        expect(tubeResult.id).equal(tube.id);
        expect(tubeResult.competenceId).equal(tube.competenceId);
        expect(tubeResult.title).equal(tube.practicalTitle);
        expect(tubeResult.description).equal(tube.practicalDescription);
        expect(tubeResult.maxLevel).equal(2);
        // mean level = user1 (niveau 1: ok, niveau 2: ko), user2 (niveau 1: ok)
        expect(tubeResult.meanLevel).equal(1);
        expect(tubeResult.competenceName).equal(competence.name);
        expect(tubeResult.areaName).equal(area.name);
      });
    });

    describe('when there is no participation', function () {
      it('should instanciate a model with correct data', function () {
        //when
        const tubeResult = new TubeResultForKnowledgeStates({
          tube,
          competence,
          area,
        });

        //then
        expect(tubeResult.id).equal(tube.id);
        expect(tubeResult.competenceId).equal(tube.competenceId);
        expect(tubeResult.title).equal(tube.practicalTitle);
        expect(tubeResult.description).equal(tube.practicalDescription);
        expect(tubeResult.maxLevel).equal(2);
        expect(tubeResult.meanLevel).equal(0);
        expect(tubeResult.competenceName).equal(competence.name);
        expect(tubeResult.areaName).equal(area.name);
      });
    });
  });
});
