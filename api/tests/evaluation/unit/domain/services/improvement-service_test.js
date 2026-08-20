import * as improvementService from '../../../../../src/evaluation/domain/services/improvement-service.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Service | ImprovementService', function () {
  let assessmentDate, knowledgeState;

  const idsOf = (skills) => skills.map(({ id }) => id).toSorted();

  beforeEach(function () {
    assessmentDate = '2020-07-30';

    const fiveDaysBefore = new Date('2020-07-25');
    const threeDaysBefore = new Date('2020-07-27');
    const twoDaysBefore = new Date('2020-07-28');
    const twoDaysAfter = new Date('2020-08-02');

    // Un acquis par tube : chaque verdict porte sa propre date.
    const tubeOf = (skillId, { validated, updatedAt }) => ({
      tubeId: skillId,
      floor: validated ? 1 : 0,
      ceiling: validated ? null : 1,
      directLevels: [1],
      updatedAt,
    });

    knowledgeState = domainBuilder.buildKnowledgeState({
      tubes: [
        tubeOf('validated5DaysBefore', { validated: true, updatedAt: fiveDaysBefore }),
        tubeOf('validated3DaysBefore', { validated: true, updatedAt: threeDaysBefore }),
        tubeOf('validated2DaysBefore', { validated: true, updatedAt: twoDaysBefore }),
        tubeOf('invalidated5DaysBefore', { validated: false, updatedAt: fiveDaysBefore }),
        tubeOf('invalidated3DaysBefore', { validated: false, updatedAt: threeDaysBefore }),
        tubeOf('invalidated2DaysBefore', { validated: false, updatedAt: twoDaysBefore }),
        tubeOf('invalidated2DaysAfter', { validated: false, updatedAt: twoDaysAfter }),
        tubeOf('validated2DaysAfter', { validated: true, updatedAt: twoDaysAfter }),
      ],
      skills: [
        'validated5DaysBefore',
        'validated3DaysBefore',
        'validated2DaysBefore',
        'invalidated5DaysBefore',
        'invalidated3DaysBefore',
        'invalidated2DaysBefore',
        'invalidated2DaysAfter',
        'validated2DaysAfter',
      ].map((id) => domainBuilder.buildSkill({ id, tubeId: id, difficulty: 1 })),
    });
  });

  describe('#improveKnowledgeState', function () {
    context('when knowledge state is read for a competence evaluation', function () {
      context('when assessment is not improving', function () {
        it('should return the state untouched', function () {
          // when
          const improved = improvementService.improveKnowledgeState({
            knowledgeState,
            isRetrying: false,
            isFromCampaign: false,
            isImproving: false,
            createdAt: assessmentDate,
          });

          // then
          expect(improved).to.equal(knowledgeState);
        });
      });

      context('when assessment is improving', function () {
        it('should keep every validation, and only the failures fresher than 4 days', function () {
          // when
          const improved = improvementService.improveKnowledgeState({
            knowledgeState,
            isImproving: true,
            isRetrying: false,
            isFromCampaign: false,
            createdAt: assessmentDate,
          });

          // then
          expect(idsOf(improved.validatedSkills())).to.deep.equal(idsOf(knowledgeState.validatedSkills()));
          expect(idsOf(improved.invalidatedSkills())).to.deep.equal([
            'invalidated2DaysAfter',
            'invalidated2DaysBefore',
            'invalidated3DaysBefore',
          ]);
        });
      });
    });

    context('when knowledge state is read for a campaign', function () {
      it('should keep every validation, and only the failures fresher than 3 days, on retrying case', function () {
        // when
        const improved = improvementService.improveKnowledgeState({
          knowledgeState,
          isImproving: false,
          isRetrying: true,
          isFromCampaign: true,
          createdAt: assessmentDate,
        });

        // then
        expect(idsOf(improved.invalidatedSkills())).to.deep.equal([
          'invalidated2DaysAfter',
          'invalidated2DaysBefore',
          'invalidated3DaysBefore',
        ]);
      });

      it('should return the state untouched when neither improving nor retrying', function () {
        // when
        const improved = improvementService.improveKnowledgeState({
          knowledgeState,
          isImproving: false,
          isRetrying: false,
          isFromCampaign: true,
          createdAt: assessmentDate,
        });

        // then
        expect(improved).to.equal(knowledgeState);
      });
    });
  });
});
