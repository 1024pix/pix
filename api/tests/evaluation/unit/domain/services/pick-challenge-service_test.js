import _ from 'lodash';

import { pickChallengeService } from '../../../../../src/evaluation/domain/services/pick-challenge-service.js';
import {
  ENGLISH_SPOKEN,
  FRENCH_FRANCE,
  FRENCH_SPOKEN,
} from '../../../../../src/shared/domain/services/locale-service.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Service | PickChallengeService', function () {
  describe('#pickChallenge', function () {
    let englishSpokenChallenge,
      frenchSpokenChallenge,
      otherFrenchSpokenChallenge,
      frenchChallenge,
      validatedChallenge,
      archivedChallenge;

    const randomSeed = 'some-random-seed';

    beforeEach(function () {
      englishSpokenChallenge = domainBuilder.evaluation.buildSmartRandomChallenge({ locales: [ENGLISH_SPOKEN] });
      frenchSpokenChallenge = domainBuilder.evaluation.buildSmartRandomChallenge({ locales: [FRENCH_SPOKEN] });
      otherFrenchSpokenChallenge = domainBuilder.evaluation.buildSmartRandomChallenge({ locales: [FRENCH_SPOKEN] });
      frenchChallenge = domainBuilder.evaluation.buildSmartRandomChallenge({ locales: [FRENCH_FRANCE] });
      validatedChallenge = domainBuilder.evaluation.buildSmartRandomChallenge({
        status: 'validé',
        locales: [FRENCH_SPOKEN],
      });
      archivedChallenge = domainBuilder.evaluation.buildSmartRandomChallenge({
        status: 'archivé',
        locales: [FRENCH_SPOKEN],
      });
    });

    context('when challenge in selected locale exists', function () {
      it('should return challenge in selected locale', function () {
        // given
        const skills = [domainBuilder.evaluation.buildSmartRandomSkill()];
        skills[0].challenges = [frenchChallenge, frenchSpokenChallenge, englishSpokenChallenge];

        // when
        const challenge = pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: ENGLISH_SPOKEN,
        });

        // then
        expect(challenge).to.equal(englishSpokenChallenge);
      });

      it('should always return the same challenge in selected locale', function () {
        // given
        const skills = [domainBuilder.evaluation.buildSmartRandomSkill()];
        skills[0].challenges = [frenchChallenge, frenchSpokenChallenge, otherFrenchSpokenChallenge];

        // when
        const challenges = _.times(5, () =>
          pickChallengeService.pickChallenge({
            skills,
            randomSeed,
            locale: FRENCH_SPOKEN,
          }),
        );

        // then
        expect(challenges).to.contains(frenchSpokenChallenge);
        expect(challenges).to.not.contains(otherFrenchSpokenChallenge);
        expect(challenges).to.not.contains(frenchChallenge);
      });
    });

    context('when there is no skills', function () {
      it('should return null', function () {
        // given
        const skills = [];

        // when
        const challenge = pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN,
        });

        // then
        expect(challenge).to.be.null;
      });
    });

    context('when skills have validated and archived challenges', function () {
      it('should return validated challenge', function () {
        // given
        const skills = [domainBuilder.evaluation.buildSmartRandomSkill()];
        skills[0].challenges = [archivedChallenge, validatedChallenge];

        // when
        const challenge = pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN,
        });

        // then
        expect(challenge).to.equal(validatedChallenge);
      });
    });

    context('when skills only have archived challenges', function () {
      it('should return archived challenge', function () {
        // given
        const skills = [domainBuilder.evaluation.buildSmartRandomSkill()];
        skills[0].challenges = [archivedChallenge];

        // when
        const challenge = pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN,
        });

        // then
        expect(challenge).to.equal(archivedChallenge);
      });
    });

    context('when picking a lot of challenges', function () {
      it('should return all challenges propose', function () {
        // given
        const challengeOneForSkillOne = domainBuilder.evaluation.buildSmartRandomChallenge({ locales: ['fr'] });
        const challengeTwoForSkillOne = domainBuilder.evaluation.buildSmartRandomChallenge({ locales: ['fr'] });
        const challengeOneForSkillTwo = domainBuilder.evaluation.buildSmartRandomChallenge({ locales: ['fr'] });
        const challengeTwoForSkillTwo = domainBuilder.evaluation.buildSmartRandomChallenge({ locales: ['fr'] });
        const skillOne = domainBuilder.evaluation.buildSmartRandomSkill();
        skillOne.challenges = [challengeOneForSkillOne, challengeTwoForSkillOne];
        const skillTwo = domainBuilder.evaluation.buildSmartRandomSkill();
        skillTwo.challenges = [challengeOneForSkillTwo, challengeTwoForSkillTwo];
        const skills = [skillOne, skillTwo];

        const challenges = _.times(50, (time) =>
          pickChallengeService.pickChallenge({
            skills,
            randomSeed: time,
            locale: FRENCH_SPOKEN,
          }),
        );

        // then
        expect(challenges).to.contains(challengeOneForSkillOne);
        expect(challenges).to.contains(challengeTwoForSkillOne);
        expect(challenges).to.contains(challengeOneForSkillTwo);
        expect(challenges).to.contains(challengeTwoForSkillTwo);
      });
    });

    context('user locale has country code', function () {
      let archivedChallenge_fr_fr, validatedChallenge_fr, validatedChallenge_fr_fr, locale;
      beforeEach(function () {
        validatedChallenge_fr = domainBuilder.evaluation.buildSmartRandomChallenge({
          status: 'validé',
          locales: [FRENCH_SPOKEN],
        });
        validatedChallenge_fr_fr = domainBuilder.evaluation.buildSmartRandomChallenge({
          status: 'validé',
          locales: [FRENCH_FRANCE],
        });
        archivedChallenge_fr_fr = domainBuilder.evaluation.buildSmartRandomChallenge({
          status: 'archivé',
          locales: [FRENCH_FRANCE],
        });
        locale = FRENCH_FRANCE;
      });

      context('when there are many challenges with different locales', function () {
        it('should prioritize challenge with an exact matching locale', function () {
          // given
          const skill = domainBuilder.evaluation.buildSmartRandomSkill();
          skill.challenges = [validatedChallenge_fr_fr, validatedChallenge_fr];
          const skills = [skill];

          // when
          const challenge = pickChallengeService.pickChallenge({
            skills,
            randomSeed,
            locale,
          });

          // then
          expect(challenge).to.equal(validatedChallenge_fr_fr);
        });

        it('should prioritize a validated challenge matching the language instead of an archived challenge with an exact matching locale', function () {
          // given
          const skill = domainBuilder.evaluation.buildSmartRandomSkill();
          skill.challenges = [archivedChallenge_fr_fr, validatedChallenge_fr];
          const skills = [skill];

          // when
          const challenge = pickChallengeService.pickChallenge({
            skills,
            randomSeed,
            locale,
          });

          // then
          expect(challenge).to.equal(validatedChallenge_fr);
        });
      });

      context('when there are only challenges with locales without country code', function () {
        it('should return challenge without country code', function () {
          // given
          const skill = domainBuilder.evaluation.buildSmartRandomSkill();
          skill.challenges = [validatedChallenge_fr];
          const skills = [skill];

          // when
          const challenge = pickChallengeService.pickChallenge({
            skills,
            randomSeed,
            locale,
          });

          // then
          expect(challenge).to.equal(validatedChallenge_fr);
        });
      });
    });
  });
});
