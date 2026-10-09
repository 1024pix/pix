import { expect } from 'chai';

import * as improvementService from '../../../../../src/evaluation/domain/services/improvement-service.js';
import { KnowledgeState } from '../../../../../src/shared/domain/models/KnowledgeState.ts';
import { buildKnowledgeElementsFromKnowledgeStates } from '../../../../../src/shared/domain/services/knowledge-state/build-knowledge-elements-from-knowledge-states.ts';
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
  describe('#filterKnowledgeElements on knowledge elements rebuilt from knowledge states', function () {
    // A five-level tube: the user knows up to level 2 and failed level 5 at some date.
    // Improving the competence today, they validate level 3: the tube moves today, the failure keeps its date.
    const today = new Date('2026-10-09T10:05:00Z');
    const assessmentStartedAt = new Date('2026-10-09T10:00:00Z');
    const skills = [1, 2, 3, 4, 5].map((difficulty) =>
      domainBuilder.buildSkill({ id: `skill${difficulty}`, tubeId: 'recTube', difficulty }),
    );
    const rebuildKnowledgeElements = (ceilingAt) =>
      buildKnowledgeElementsFromKnowledgeStates({
        knowledgeStates: [
          new KnowledgeState({
            userId: 1,
            tubeId: 'recTube',
            floor: 3,
            ceiling: 5,
            ceilingAt,
            directLevels: [3, 5],
            updatedAt: today,
          }),
        ],
        skills,
      });

    it('should let an old failure be assessed again, although its tube moved today', function () {
      // given
      const knowledgeElements = rebuildKnowledgeElements(new Date('2026-04-01'));

      // when
      const kept = improvementService.filterKnowledgeElements({
        knowledgeElements,
        createdAt: assessmentStartedAt,
        isImproving: true,
      });

      // then
      expect(kept.map(({ skillId }) => skillId)).to.deep.equal(['skill1', 'skill2', 'skill3']);
    });

    it('should keep a failure too recent to be improved', function () {
      // given
      const knowledgeElements = rebuildKnowledgeElements(new Date('2026-10-08'));

      // when
      const kept = improvementService.filterKnowledgeElements({
        knowledgeElements,
        createdAt: assessmentStartedAt,
        isImproving: true,
      });

      // then
      expect(kept.map(({ skillId }) => skillId)).to.deep.equal(['skill1', 'skill2', 'skill3', 'skill5']);
    });
  });
});
