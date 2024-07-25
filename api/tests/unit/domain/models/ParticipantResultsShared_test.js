import lodash from 'lodash';

import { MAX_REACHABLE_PIX_BY_COMPETENCE } from '../../../../src/shared/domain/constants.js';
import { KnowledgeElement } from '../../../../src/shared/domain/models/KnowledgeElement.js';
import { ParticipantResultsShared } from '../../../../src/shared/domain/models/ParticipantResultsShared.js';
import { domainBuilder, expect } from '../../../test-helper.js';
const { noop } = lodash;

describe('Unit | Domain | Models | ParticipantResultsShared', function () {
  context('#masteryRate', function () {
    context('when there are targetSkills', function () {
      it('computes the masteryRate using the number of skill validated', function () {
        // given
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED }),
          domainBuilder.buildKnowledgeElement({ skillId: 'skill2', status: KnowledgeElement.StatusType.INVALIDATED }),
        ];

        const skillIds = ['skill1', 'skill2', 'skill3'];

        // when
        const participantResultsShared = new ParticipantResultsShared({
          knowledgeElements,
          skillIds,
        });

        // then
        expect(participantResultsShared.masteryRate).to.be.equal(1 / 3);
      });
    });

    context('when there are no targetSkills', function () {
      it('computes the masteryPercentage using the pixScore and the maximal pix score', function () {
        // given
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: 'skill1',
            earnedPix: 10,
            status: KnowledgeElement.StatusType.VALIDATED,
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: 'skill2',
            earnedPix: 0,
            status: KnowledgeElement.StatusType.INVALIDATED,
          }),
        ];

        const skillIds = [];

        // when
        const participantResultsShared = new ParticipantResultsShared({
          knowledgeElements,
          skillIds,
          placementProfile: { isCertifiable: noop },
        });

        // then
        expect(participantResultsShared.masteryRate).to.be.equal(10 / (16 * MAX_REACHABLE_PIX_BY_COMPETENCE));
      });
    });
  });

  context('#isCertifiable', function () {
    context('when there are targetSkills', function () {
      it('computes isCertifiable as null', function () {
        // given
        const knowledgeElements = [];
        const skillIds = ['skill1', 'skill2', 'skill3'];

        // when
        const participantResultsShared = new ParticipantResultsShared({
          knowledgeElements,
          skillIds,
        });

        // then
        expect(participantResultsShared.isCertifiable).to.be.null;
      });
    });

    context('when there are no targetSkills', function () {
      it('computes isCertifiable with placementProfile', function () {
        // given
        const knowledgeElements = [];
        const skillIds = [];
        const isCertifiable = Symbol('isCertifiable');

        // when
        const participantResultsShared = new ParticipantResultsShared({
          knowledgeElements,
          skillIds,
          placementProfile: { isCertifiable: () => isCertifiable },
        });

        // then
        expect(participantResultsShared.isCertifiable).to.equal(isCertifiable);
      });
    });
  });

  it('returns the validated skills count', function () {
    // given
    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill2', status: KnowledgeElement.StatusType.INVALIDATED }),
    ];

    const skillIds = ['skill1', 'skill2', 'skill3'];

    // when
    const participantResultsShared = new ParticipantResultsShared({
      knowledgeElements,
      skillIds,
    });

    // then
    expect(participantResultsShared.validatedSkillsCount).to.be.equal(1);
  });

  it('returns the Pix score', function () {
    // given
    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({ skillId: 'skill1.1', earnedPix: 8 }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill2.1', earnedPix: 1 }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill3.1', earnedPix: 2 }),
    ];

    const skillIds = ['skill1.1', 'skill2.1'];

    // when
    const participantResultsShared = new ParticipantResultsShared({
      knowledgeElements,
      skillIds,
    });

    // then
    expect(participantResultsShared.pixScore).to.be.equal(9);
  });
});
