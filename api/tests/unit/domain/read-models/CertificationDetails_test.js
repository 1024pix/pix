import { expect, domainBuilder } from '../../../test-helper';
import CertificationDetails from '../../../../lib/domain/read-models/CertificationDetails';
import { states } from '../../../../lib/domain/models/CertificationAssessment';

describe('Unit | Domain | Read-models | CertificationDetails', function () {
  describe('static #from', function () {
    it('should return a CertificationDetails', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec123',
        competenceId: 'recComp1',
        associatedSkillName: 'manger une mangue',
        isNeutralized: false,
      });
      const answer1 = domainBuilder.buildAnswer.ok({ challengeId: 'rec123', value: 'prout' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec456',
        competenceId: 'recComp2',
        associatedSkillName: 'faire son lit',
        isNeutralized: false,
      });
      const answer2 = domainBuilder.buildAnswer.ko({ challengeId: 'rec456', value: 'bidule' });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        id: 123,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-03-03'),
        state: states.COMPLETED,
        certificationChallenges: [certificationChallenge1, certificationChallenge2],
        certificationAnswersByDate: [answer1, answer2],
      });
      const competenceMark1 = domainBuilder.buildCompetenceMark({
        competenceId: 'recComp1',
        score: 5,
        level: 1,
        competence_code: '1.1',
        area_code: '1',
      });
      const competenceMark2 = domainBuilder.buildCompetenceMark({
        competenceId: 'recComp2',
        score: 17,
        level: 2,
        competence_code: '2.2',
        area_code: '2',
      });
      const competenceMarks = [competenceMark1, competenceMark2];
      const placementProfile = domainBuilder.buildPlacementProfile.buildForCompetences({
        competencesData: [
          { id: 'recComp1', index: '1.1', name: 'Manger des fruits', level: 3, score: 45 },
          { id: 'recComp2', index: '2.2', name: 'Ranger sa chambre', level: 2, score: 18 },
        ],
      });

      // when
      const certificationDetails = CertificationDetails.from({
        certificationAssessment,
        placementProfile,
        competenceMarks,
      });

      // then
      const expectedCertificationDetails = domainBuilder.buildCertificationDetails({
        id: 123,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-03-03'),
        status: states.COMPLETED,
        totalScore: 22,
        percentageCorrectAnswers: 50,
        competencesWithMark: [
          {
            areaCode: '1',
            id: 'recComp1',
            index: '1.1',
            name: 'Manger des fruits',
            obtainedLevel: 1,
            obtainedScore: 5,
            positionedLevel: 3,
            positionedScore: 45,
          },
          {
            areaCode: '2',
            id: 'recComp2',
            index: '2.2',
            name: 'Ranger sa chambre',
            obtainedLevel: 2,
            obtainedScore: 17,
            positionedLevel: 2,
            positionedScore: 18,
          },
        ],
        listChallengesAndAnswers: [
          {
            challengeId: 'rec123',
            competence: '1.1',
            isNeutralized: false,
            hasBeenSkippedAutomatically: false,
            result: 'ok',
            skill: 'manger une mangue',
            value: 'prout',
          },
          {
            challengeId: 'rec456',
            competence: '2.2',
            isNeutralized: false,
            hasBeenSkippedAutomatically: false,
            result: 'ko',
            skill: 'faire son lit',
            value: 'bidule',
          },
        ],
      });
      expect(certificationDetails.toDTO()).to.deep.equal(expectedCertificationDetails.toDTO());
    });

    it('should take into account neutralized challenges when computing the percentage of correct answers', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec123',
        isNeutralized: true,
      });
      const answer1 = domainBuilder.buildAnswer.ok({ challengeId: 'rec123' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec456' });
      const answer2 = domainBuilder.buildAnswer.ko({ challengeId: 'rec456' });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1, certificationChallenge2],
        certificationAnswersByDate: [answer1, answer2],
      });
      const competenceMarks = [];
      const placementProfile = null;

      // when
      const certificationDetails = CertificationDetails.from({
        certificationAssessment,
        placementProfile,
        competenceMarks,
      });

      // then
      expect(certificationDetails.toDTO().percentageCorrectAnswers).to.equal(0);
    });

    it('should have the "challenges and answers" list ordered by answer date with unanswered challenges at the end', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec123',
        competenceId: 'recComp1',
        isNeutralized: true,
      });
      const answer1 = domainBuilder.buildAnswer.ok({ challengeId: 'rec123' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec456',
        competenceId: 'recComp1',
      });
      const answer2 = domainBuilder.buildAnswer.ko({ challengeId: 'rec456' });
      const certificationChallenge3 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec789',
        competenceId: 'recComp2',
        isNeutralized: true,
      });
      const certificationChallenge4 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'recABC',
        competenceId: 'recComp1',
        hasBeenSkippedAutomatically: true,
      });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [
          certificationChallenge3,
          certificationChallenge1,
          certificationChallenge4,
          certificationChallenge2,
        ],
        certificationAnswersByDate: [answer1, answer2],
      });
      const competenceMark1 = domainBuilder.buildCompetenceMark({
        competenceId: 'recComp1',
        score: 5,
        level: 1,
        competence_code: '1.1',
        area_code: '1',
      });
      const competenceMark2 = domainBuilder.buildCompetenceMark({
        competenceId: 'recComp2',
        score: 5,
        level: 1,
        competence_code: '1.2',
        area_code: '1',
      });
      const competenceMarks = [competenceMark1, competenceMark2];
      const placementProfile = domainBuilder.buildPlacementProfile.buildForCompetences({
        competencesData: [
          { id: 'recComp1', index: '1.1', name: 'Manger des fruits', level: 3, score: 45 },
          { id: 'recComp2', index: '1.2', name: 'Manger des legumes', level: 3, score: 45 },
        ],
      });

      // when
      const certificationDetails = CertificationDetails.from({
        certificationAssessment,
        placementProfile,
        competenceMarks,
      });

      // then
      expect(certificationDetails.toDTO().listChallengesAndAnswers).to.deep.equal([
        {
          challengeId: 'rec123',
          competence: '1.1',
          isNeutralized: true,
          hasBeenSkippedAutomatically: false,
          result: 'ok',
          skill: 'cueillir des fleurs',
          value: '1',
        },
        {
          challengeId: 'rec456',
          competence: '1.1',
          isNeutralized: false,
          hasBeenSkippedAutomatically: false,
          result: 'ko',
          skill: 'cueillir des fleurs',
          value: '1',
        },
        {
          challengeId: 'recABC',
          competence: '1.1',
          isNeutralized: false,
          hasBeenSkippedAutomatically: true,
          result: undefined,
          skill: 'cueillir des fleurs',
          value: undefined,
        },
        {
          challengeId: 'rec789',
          competence: '1.2',
          isNeutralized: true,
          hasBeenSkippedAutomatically: false,
          result: undefined,
          skill: 'cueillir des fleurs',
          value: undefined,
        },
      ]);
    });
  });

  describe('static #fromCertificationAssessmentScore', function () {
    it('should return a CertificationDetails', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec123',
        competenceId: 'recComp1',
        associatedSkillName: 'manger une mangue',
        isNeutralized: false,
      });
      const answer1 = domainBuilder.buildAnswer.ok({ challengeId: 'rec123', value: 'prout' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec456',
        competenceId: 'recComp2',
        associatedSkillName: 'faire son lit',
        isNeutralized: false,
      });
      const answer2 = domainBuilder.buildAnswer.ko({ challengeId: 'rec456', value: 'bidule' });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        id: 123,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-03-03'),
        state: states.COMPLETED,
        certificationChallenges: [certificationChallenge1, certificationChallenge2],
        certificationAnswersByDate: [answer1, answer2],
      });
      const competenceMark1 = domainBuilder.buildCompetenceMark({
        competenceId: 'recComp1',
        score: 5,
        level: 1,
        competence_code: '1.1',
        area_code: '1',
      });
      const competenceMark2 = domainBuilder.buildCompetenceMark({
        competenceId: 'recComp2',
        score: 17,
        level: 2,
        competence_code: '2.2',
        area_code: '2',
      });
      const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        competenceMarks: [competenceMark1, competenceMark2],
        percentageCorrectAnswers: 50,
      });
      const placementProfile = domainBuilder.buildPlacementProfile.buildForCompetences({
        competencesData: [
          { id: 'recComp1', index: '1.1', name: 'Manger des fruits', level: 3, score: 45 },
          { id: 'recComp2', index: '2.2', name: 'Ranger sa chambre', level: 2, score: 18 },
        ],
      });

      // when
      const certificationDetails = CertificationDetails.fromCertificationAssessmentScore({
        certificationAssessmentScore,
        certificationAssessment,
        placementProfile,
      });

      // then
      const expectedCertificationDetails = domainBuilder.buildCertificationDetails({
        id: 123,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-03-03'),
        status: states.COMPLETED,
        totalScore: 22,
        percentageCorrectAnswers: 50,
        competencesWithMark: [
          {
            areaCode: '1',
            id: 'recComp1',
            index: '1.1',
            name: 'Manger des fruits',
            obtainedLevel: 1,
            obtainedScore: 5,
            positionedLevel: 3,
            positionedScore: 45,
          },
          {
            areaCode: '2',
            id: 'recComp2',
            index: '2.2',
            name: 'Ranger sa chambre',
            obtainedLevel: 2,
            obtainedScore: 17,
            positionedLevel: 2,
            positionedScore: 18,
          },
        ],
        listChallengesAndAnswers: [
          {
            challengeId: 'rec123',
            competence: '1.1',
            isNeutralized: false,
            hasBeenSkippedAutomatically: false,
            result: 'ok',
            skill: 'manger une mangue',
            value: 'prout',
          },
          {
            challengeId: 'rec456',
            competence: '2.2',
            isNeutralized: false,
            hasBeenSkippedAutomatically: false,
            result: 'ko',
            skill: 'faire son lit',
            value: 'bidule',
          },
        ],
      });
      expect(certificationDetails.toDTO()).to.deep.equal(expectedCertificationDetails.toDTO());
    });

    it('should have the "challenges and answers" list ordered by answer date with unanswered challenges at the end', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec123',
        competenceId: 'recComp1',
        isNeutralized: true,
      });
      const answer1 = domainBuilder.buildAnswer.ok({ challengeId: 'rec123' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec456',
        competenceId: 'recComp1',
      });
      const answer2 = domainBuilder.buildAnswer.ko({ challengeId: 'rec456' });
      const certificationChallenge3 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec789',
        competenceId: 'recComp2',
        isNeutralized: true,
      });
      const certificationChallenge4 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'recABC',
        competenceId: 'recComp1',
        hasBeenSkippedAutomatically: true,
      });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [
          certificationChallenge3,
          certificationChallenge1,
          certificationChallenge4,
          certificationChallenge2,
        ],
        certificationAnswersByDate: [answer1, answer2],
      });
      const competenceMark1 = domainBuilder.buildCompetenceMark({
        competenceId: 'recComp1',
        score: 5,
        level: 1,
        competence_code: '1.1',
        area_code: '1',
      });
      const competenceMark2 = domainBuilder.buildCompetenceMark({
        competenceId: 'recComp2',
        score: 5,
        level: 1,
        competence_code: '1.2',
        area_code: '1',
      });
      const competenceMarks = [competenceMark1, competenceMark2];
      const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        competenceMarks,
        percentageCorrectAnswers: 50,
      });
      const placementProfile = domainBuilder.buildPlacementProfile.buildForCompetences({
        competencesData: [
          { id: 'recComp1', index: '1.1', name: 'Manger des fruits', level: 3, score: 45 },
          { id: 'recComp2', index: '1.2', name: 'Manger des legumes', level: 3, score: 45 },
        ],
      });

      // when
      const certificationDetails = CertificationDetails.fromCertificationAssessmentScore({
        certificationAssessment,
        placementProfile,
        certificationAssessmentScore,
      });

      // then
      expect(certificationDetails.toDTO().listChallengesAndAnswers).to.deep.equal([
        {
          challengeId: 'rec123',
          competence: '1.1',
          isNeutralized: true,
          hasBeenSkippedAutomatically: false,
          result: 'ok',
          skill: 'cueillir des fleurs',
          value: '1',
        },
        {
          challengeId: 'rec456',
          competence: '1.1',
          isNeutralized: false,
          hasBeenSkippedAutomatically: false,
          result: 'ko',
          skill: 'cueillir des fleurs',
          value: '1',
        },
        {
          challengeId: 'recABC',
          competence: '1.1',
          isNeutralized: false,
          hasBeenSkippedAutomatically: true,
          result: undefined,
          skill: 'cueillir des fleurs',
          value: undefined,
        },
        {
          challengeId: 'rec789',
          competence: '1.2',
          isNeutralized: true,
          hasBeenSkippedAutomatically: false,
          result: undefined,
          skill: 'cueillir des fleurs',
          value: undefined,
        },
      ]);
    });
  });

  describe('#toDTO', function () {
    it('should return a DTO version of a CertificationDetails', function () {
      // given
      const competencesWithMark = [
        {
          areaCode: '1',
          id: 'recComp1',
          index: '1.1',
          name: 'Manger des fruits',
          obtainedLevel: 1,
          obtainedScore: 5,
          positionedLevel: 3,
          positionedScore: 45,
        },
        {
          areaCode: '2',
          id: 'recComp2',
          index: '2.2',
          name: 'Ranger sa chambre',
          obtainedLevel: 2,
          obtainedScore: 17,
          positionedLevel: 2,
          positionedScore: 18,
        },
      ];
      const listChallengesAndAnswers = [
        {
          challengeId: 'rec123',
          competence: '1.1',
          isNeutralized: true,
          result: 'ok',
          skill: 'manger une mangue',
          value: 'prout',
        },
        {
          challengeId: 'rec456',
          competence: '2.2',
          isNeutralized: false,
          result: 'ko',
          skill: 'faire son lit',
          value: 'bidule',
        },
      ];
      const certificationDetails = domainBuilder.buildCertificationDetails({
        id: 123,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-03-03'),
        status: states.COMPLETED,
        totalScore: 45,
        percentageCorrectAnswers: 12,
        competencesWithMark,
        listChallengesAndAnswers,
      });

      // when
      const actualDTO = certificationDetails.toDTO();

      // then
      expect(actualDTO).to.deep.equal({
        id: 123,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-03-03'),
        status: states.COMPLETED,
        totalScore: 45,
        percentageCorrectAnswers: 12,
        competencesWithMark: [...competencesWithMark],
        listChallengesAndAnswers: [...listChallengesAndAnswers],
      });
    });
  });
});
