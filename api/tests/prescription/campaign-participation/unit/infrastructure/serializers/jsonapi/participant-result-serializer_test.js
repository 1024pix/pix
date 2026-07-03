import sinon from 'sinon';

import { participantResultSerializer } from '../../../../../../../src/prescription/campaign-participation/infrastructure/serializers/jsonapi/participant-result-serializer.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElement } from '../../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { AssessmentResult } from '../../../../../../../src/shared/domain/read-models/participant-results/AssessmentResult.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | JSON API | participant-result-serializer', function () {
  context('#serialize', function () {
    const isCampaignMultipleSendings = true;
    const isTargetProfileResetAllowed = true;
    const isOrganizationLearnerActive = true;
    const isCampaignArchived = false;
    const sharedAt = new Date('2020-01-01');
    let participationResults, competences, stages, badgeResultsDTO, reachedStage;
    let clock, now;

    beforeEach(function () {
      now = new Date('2020-01-04');
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({
          skillId: 'skill1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        }),
        domainBuilder.buildKnowledgeElement({
          skillId: 'skill2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        }),
      ];

      participationResults = {
        campaignParticipationId: 1,
        isCompleted: true,
        sharedAt,
        status: CampaignParticipationStatuses.SHARED,
        knowledgeElements: knowledgeElements,
        acquiredBadgeIds: [3],
        participantExternalId: 'greg@lafleche.fr',
        masteryRate: 0.5,
        isDeleted: false,
      };

      competences = [
        {
          competence: domainBuilder.buildCompetence({
            id: 'C1',
            name: 'Competence1',
            index: '1.1',
            description: 'Une description',
          }),
          area: domainBuilder.buildArea({
            title: 'DomaineNom',
            color: 'AreaColor',
          }),
          targetedSkillIds: ['skill1', 'skill2'],
        },
      ];

      stages = [
        { id: 2, title: 'Stage1', message: 'Message1', threshold: 0 },
        { id: 3, title: 'Stage2', message: 'Message2', threshold: 50 },
        { id: 4, title: 'Stage3', message: 'Message3', threshold: 100 },
      ];

      reachedStage = {
        id: 3,
        title: 'Stage2',
        message: 'Message2',
        threshold: 50,
        totalStage: 3,
        reachedStage: 2,
      };

      badgeResultsDTO = [
        {
          id: 3,
          altMessage: 'Badge2 AltMessage',
          message: 'Badge2 Message',
          title: 'Badge2 Title',
          imageUrl: 'Badge2 ImgUrl',
          key: 'Badge2 Key',
          isAlwaysVisible: true,
          isCertifiable: false,
          isValid: true,
          acquisitionPercentage: null,
        },
      ];
    });
    afterEach(function () {
      clock.restore();
    });

    it('should convert a CampaignParticipationResult model object into JSON API data', function () {
      // given
      const assessmentResult = new AssessmentResult({
        participationResults,
        competences,
        badgeResultsDTO,
        reachedStage,
        stages,
        isCampaignMultipleSendings,
        campaignType: CampaignTypes.ASSESSMENT,
        isOrganizationLearnerActive,
        isCampaignArchived,
        isTargetProfileResetAllowed,
      });

      const expectedSerializedCampaignParticipationResult = {
        data: {
          attributes: {
            'can-reset': false,
            'can-retry': true,
            'remaining-seconds-before-retrying': 3600 * 24 * 1,
            'is-completed': true,
            'is-disabled': false,
            'is-shared': true,
            'mastery-rate': 0.5,
            'participant-external-id': 'greg@lafleche.fr',
            'tested-skills-count': 2,
            'total-skills-count': 2,
            'validated-skills-count': 1,
            'shared-at': sharedAt,
          },
          id: '1',
          relationships: {
            'campaign-participation-badges': {
              data: [
                {
                  id: '3',
                  type: 'campaignParticipationBadges',
                },
              ],
            },
            'competence-results': {
              data: [
                {
                  id: 'C1',
                  type: 'competenceResults',
                },
              ],
            },
            'reached-stage': {
              data: {
                id: '3',
                type: 'reached-stages',
              },
            },
          },
          type: 'campaign-participation-results',
        },
        included: [
          {
            attributes: {
              'alt-message': 'Badge2 AltMessage',
              message: 'Badge2 Message',
              title: 'Badge2 Title',
              'image-url': 'Badge2 ImgUrl',
              key: 'Badge2 Key',
              'is-acquired': true,
              'is-always-visible': true,
              'is-certifiable': false,
              'is-valid': true,
              'acquisition-percentage': null,
            },
            id: '3',
            type: 'campaignParticipationBadges',
          },
          {
            attributes: {
              'area-color': 'AreaColor',
              'area-title': 'DomaineNom',
              index: '1.1',
              name: 'Competence1',
              description: 'Une description',
              'mastery-percentage': 50,
              'reached-stage': 2,
              'tested-skills-count': 2,
              'total-skills-count': 2,
              'validated-skills-count': 1,
            },
            id: 'C1',
            type: 'competenceResults',
          },
          {
            attributes: {
              title: 'Stage2',
              message: 'Message2',
              'total-stage': 3,
              'reached-stage': 2,
              threshold: 50,
            },
            id: '3',
            type: 'reached-stages',
          },
        ],
      };

      // when
      const json = participantResultSerializer.serialize(assessmentResult);

      // then
      expect(json).to.deep.equal(expectedSerializedCampaignParticipationResult);
    });
  });
});
