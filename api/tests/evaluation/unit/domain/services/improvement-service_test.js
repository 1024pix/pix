import { expect } from 'chai';

import * as improvementService from '../../../../../src/evaluation/domain/services/improvement-service.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Service | ImprovementService', function () {
  let assessmentDate, oldKnowledgeElementsValidated, oldKnowledgeElementsInvalidated, recentKnowledgeElements;
  let knowledgeElements;

  beforeEach(function () {
    assessmentDate = '2020-07-30';

    //Data For Improvement Service
    const fiveDaysBeforeAssesmentDate = '2020-07-25';
    const threeDaysBeforeAssesmentDate = '2020-07-27';
    const twoDaysBeforeAssesmentDate = '2020-07-28';
    const twoDaysAfterAssesmentDate = '2020-08-02';

    oldKnowledgeElementsValidated = [
      domainBuilder.buildKnowledgeElement({
        skillId: 'validated5DaysBefore',
        status: 'validated',
        createdAt: fiveDaysBeforeAssesmentDate,
      }),
      domainBuilder.buildKnowledgeElement({
        skillId: 'validated3DaysBefore',
        status: 'validated',
        createdAt: threeDaysBeforeAssesmentDate,
      }),
      domainBuilder.buildKnowledgeElement({
        skillId: 'validated2DaysBefore',
        status: 'validated',
        createdAt: twoDaysBeforeAssesmentDate,
      }),
    ];

    oldKnowledgeElementsInvalidated = [
      domainBuilder.buildKnowledgeElement({
        skillId: 'invalidated5DaysBefore',
        status: 'invalidated',
        createdAt: fiveDaysBeforeAssesmentDate,
      }),
      domainBuilder.buildKnowledgeElement({
        skillId: 'invalidated3DaysBefore',
        status: 'invalidated',
        createdAt: threeDaysBeforeAssesmentDate,
      }),
      domainBuilder.buildKnowledgeElement({
        skillId: 'invalidated2DaysBefore',
        status: 'invalidated',
        createdAt: twoDaysBeforeAssesmentDate,
      }),
    ];

    recentKnowledgeElements = [
      domainBuilder.buildKnowledgeElement({
        skillId: 'invalidated2DaysAfter',
        status: 'invalidated',
        createdAt: twoDaysAfterAssesmentDate,
      }),
      domainBuilder.buildKnowledgeElement({
        skillId: 'validated2DaysAfter',
        status: 'validated',
        createdAt: twoDaysAfterAssesmentDate,
      }),
    ];

    knowledgeElements = [].concat(
      ...oldKnowledgeElementsValidated,
      ...oldKnowledgeElementsInvalidated,
      ...recentKnowledgeElements,
    );
  });

  describe('#filterKnowledgeElements', function () {
    context('when knowledgeElements are calculated for competence evaluation case', function () {
      context('when assessment is not improving', function () {
        it('should return the same list of knowledge-elements', function () {
          // when
          const listOfKnowledgeElements = improvementService.filterKnowledgeElements({
            knowledgeElements,
            isRetrying: false,
            isFromCampaign: false,
            isImproving: false,
            createdAt: assessmentDate,
          });

          // then
          expect(listOfKnowledgeElements).to.deep.equal(knowledgeElements);
        });
      });

      context('when assessment is improving', function () {
        it('should return all validated ke, and invalidated ke created less than 4 days', function () {
          // when
          const listOfKnowledgeElements = improvementService.filterKnowledgeElements({
            knowledgeElements,
            isImproving: true,
            isRetrying: false,
            isFromCampaign: false,
            createdAt: assessmentDate,
          });

          // then
          expect(listOfKnowledgeElements.map(({ skillId }) => skillId)).to.deep.equal([
            'validated5DaysBefore',
            'validated3DaysBefore',
            'validated2DaysBefore',
            'invalidated3DaysBefore',
            'invalidated2DaysBefore',
            'invalidated2DaysAfter',
            'validated2DaysAfter',
          ]);
        });
      });
    });

    context('when the answers of the assessment are given', function () {
      const tube = 'tube_batailles';
      const level2 = domainBuilder.buildSkill({ id: 'batailles2', tubeId: tube, difficulty: 2 });
      const level3 = domainBuilder.buildSkill({ id: 'batailles3', tubeId: tube, difficulty: 3 });
      const level4 = domainBuilder.buildSkill({ id: 'batailles4', tubeId: tube, difficulty: 4 });
      const otherTubeLevel3 = domainBuilder.buildSkill({ id: 'présidents3', tubeId: 'tube_présidents', difficulty: 3 });
      const targetSkills = [level2, level3, level4, otherTubeLevel3];
      const assessmentStart = new Date('2026-10-07T10:00:00Z');
      const duringAssessment = new Date('2026-10-07T10:05:00Z');
      const failure = (skill, createdAt) =>
        domainBuilder.buildKnowledgeElement({
          skillId: skill.id,
          status: 'invalidated',
          createdAt,
          assessmentId: null,
        });

      it('should keep a failure made during the assessment only when its skill was answered, or failed below it', function () {
        // given: every failure of the tube is dated during the assessment, as for a user stored as knowledge states
        const knowledgeElements = [
          failure(level2, duringAssessment),
          failure(level3, duringAssessment),
          failure(level4, duringAssessment),
          failure(otherTubeLevel3, duringAssessment),
        ];

        // when: the assessment answered level 3 wrong, nothing else
        const kept = improvementService.filterKnowledgeElements({
          knowledgeElements,
          isImproving: true,
          createdAt: assessmentStart,
          answeredSkills: [{ skill: level3, isOk: false }],
          targetSkills,
        });

        // then: level 3 was answered, level 4 is invalidated by it; levels 2 and the other tube are not
        expect(kept.map(({ skillId }) => skillId)).to.deep.equal(['batailles3', 'batailles4']);
      });

      it('should keep a failure made during the assessment by an answer, told by its assessment id', function () {
        // given: a knowledge element created by today's code, not rebuilt from a knowledge state
        const createdByAnAnswer = domainBuilder.buildKnowledgeElement({
          skillId: level2.id,
          status: 'invalidated',
          createdAt: duringAssessment,
          assessmentId: 456,
        });

        // when: whatever the answers say
        const kept = improvementService.filterKnowledgeElements({
          knowledgeElements: [createdByAnAnswer],
          isImproving: true,
          createdAt: assessmentStart,
          answeredSkills: [],
          targetSkills,
        });

        // then
        expect(kept).to.deep.equal([createdByAnAnswer]);
      });

      it('should not keep a failure above a level the assessment validated', function () {
        // when
        const kept = improvementService.filterKnowledgeElements({
          knowledgeElements: [failure(level2, duringAssessment), failure(level3, duringAssessment)],
          isImproving: true,
          createdAt: assessmentStart,
          answeredSkills: [{ skill: level2, isOk: true }],
          targetSkills,
        });

        // then
        expect(kept.map(({ skillId }) => skillId)).to.deep.equal(['batailles2']);
      });

      it('should keep a failure made during the assessment on a skill outside the target skills', function () {
        // when
        const kept = improvementService.filterKnowledgeElements({
          knowledgeElements: [failure({ id: 'outside' }, duringAssessment)],
          isImproving: true,
          createdAt: assessmentStart,
          answeredSkills: [],
          targetSkills,
        });

        // then
        expect(kept.map(({ skillId }) => skillId)).to.deep.equal(['outside']);
      });

      it('should read the failures made before the assessment by their date, as without answers', function () {
        // given
        const knowledgeElements = [failure(level2, '2026-10-05'), failure(level3, '2020-01-01')];

        // when
        const kept = improvementService.filterKnowledgeElements({
          knowledgeElements,
          isImproving: true,
          createdAt: assessmentStart,
          minimumDelayInDaysBeforeImproving: 4,
          answeredSkills: [
            { skill: level2, isOk: true },
            { skill: level3, isOk: false },
          ],
          targetSkills,
        });

        // then: two days old is too recent, 2020 is not, whatever the answers
        expect(kept.map(({ skillId }) => skillId)).to.deep.equal(['batailles2']);
      });

      it('should apply the same reading on a campaign retry', function () {
        // when
        const kept = improvementService.filterKnowledgeElements({
          knowledgeElements: [
            failure(level2, '2026-10-05'),
            failure(level3, duringAssessment),
            failure(level4, duringAssessment),
          ],
          isRetrying: true,
          isFromCampaign: true,
          createdAt: assessmentStart,
          answeredSkills: [{ skill: level4, isOk: false }],
          targetSkills,
        });

        // then: before the start, nothing is kept; during, only the answered level
        expect(kept.map(({ skillId }) => skillId)).to.deep.equal(['batailles4']);
      });
    });

    context('when knowledgeElements are calculated for campaign case', function () {
      it('should return all validated ke, and ke acquired since the assessment started, on retrying case', function () {
        // when
        const listOfKnowledgeElements = improvementService.filterKnowledgeElements({
          knowledgeElements,
          isRetrying: true,
          isImproving: false,
          isFromCampaign: true,
          createdAt: assessmentDate,
          minimumDelayInDaysBeforeImproving: 4,
        });

        // then
        expect(listOfKnowledgeElements.map(({ skillId }) => skillId)).to.exactlyContain([
          'validated5DaysBefore',
          'validated3DaysBefore',
          'validated2DaysBefore',
          'invalidated2DaysAfter',
          'validated2DaysAfter',
        ]);
      });

      it('should return all validated ke, and ke acquired since the assessment started, on improving case', function () {
        // when
        const listOfKnowledgeElements = improvementService.filterKnowledgeElements({
          knowledgeElements,
          isRetrying: false,
          isImproving: true,
          isFromCampaign: true,
          createdAt: assessmentDate,
          minimumDelayInDaysBeforeImproving: 4,
        });

        // then
        expect(listOfKnowledgeElements.map(({ skillId }) => skillId)).to.exactlyContain([
          'validated5DaysBefore',
          'validated3DaysBefore',
          'validated2DaysBefore',
          'invalidated2DaysAfter',
          'validated2DaysAfter',
        ]);
      });
    });
  });
});
