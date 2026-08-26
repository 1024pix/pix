import lodash from 'lodash';

import { ParticipantResultsShared } from '../../../../../../src/prescription/campaign-participation/domain/models/ParticipantResultsShared.js';
import { MAX_REACHABLE_PIX_BY_COMPETENCE } from '../../../../../../src/shared/constants.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

const { noop } = lodash;

describe('Unit | Domain | Models | ParticipantResultsShared', function () {
  context('#masteryRate', function () {
    context('when there are targetSkills', function () {
      it('computes the masteryRate using the number of skill validated', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          validatedSkillIds: ['skill1'],
          invalidatedSkillIds: ['skill2'],
        });

        const skillIds = ['skill1', 'skill2', 'skill3'];

        // when
        const participantResultsShared = new ParticipantResultsShared({
          knowledgeState,
          skillIds,
        });

        // then
        expect(participantResultsShared.masteryRate).to.be.equal(1 / 3);
      });
    });

    context('when there are no targetSkills', function () {
      it('computes the masteryPercentage using the pixScore and the maximal pix score', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          validatedSkillIds: ['skill1'],
          invalidatedSkillIds: ['skill2'],
          pixValue: 10,
        });

        const skillIds = [];

        // when
        const participantResultsShared = new ParticipantResultsShared({
          knowledgeState,
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
        const knowledgeState = domainBuilder.buildKnowledgeState();
        const skillIds = ['skill1', 'skill2', 'skill3'];

        // when
        const participantResultsShared = new ParticipantResultsShared({
          knowledgeState,
          skillIds,
        });

        // then
        expect(participantResultsShared.isCertifiable).to.be.null;
      });
    });

    context('when there are no targetSkills', function () {
      it('computes isCertifiable with placementProfile', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState();
        const skillIds = [];
        const isCertifiable = Symbol('isCertifiable');

        // when
        const participantResultsShared = new ParticipantResultsShared({
          knowledgeState,
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
    const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
      validatedSkillIds: ['skill1'],
      invalidatedSkillIds: ['skill2'],
    });

    const skillIds = ['skill1', 'skill2', 'skill3'];

    // when
    const participantResultsShared = new ParticipantResultsShared({
      knowledgeState,
      skillIds,
    });

    // then
    expect(participantResultsShared.validatedSkillsCount).to.be.equal(1);
  });

  it('returns the Pix score', function () {
    // given
    // Trois acquis validés, chacun dans sa compétence, valant 8, 1 et 2 pix.
    const knowledgeState = domainBuilder.buildKnowledgeState({
      tubes: ['skill1.1', 'skill2.1', 'skill3.1'].map((id) => ({ tubeId: id, floor: 1, directLevels: [1] })),
      skills: [
        domainBuilder.buildSkill({
          id: 'skill1.1',
          tubeId: 'skill1.1',
          difficulty: 1,
          pixValue: 8,
          competenceId: 'c1',
        }),
        domainBuilder.buildSkill({
          id: 'skill2.1',
          tubeId: 'skill2.1',
          difficulty: 1,
          pixValue: 1,
          competenceId: 'c2',
        }),
        domainBuilder.buildSkill({
          id: 'skill3.1',
          tubeId: 'skill3.1',
          difficulty: 1,
          pixValue: 2,
          competenceId: 'c3',
        }),
      ],
    });

    const skillIds = ['skill1.1', 'skill2.1'];

    // when
    const participantResultsShared = new ParticipantResultsShared({
      knowledgeState,
      skillIds,
    });

    // then
    expect(participantResultsShared.pixScore).to.be.equal(9);
  });
});
