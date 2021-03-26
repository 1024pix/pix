const { expect, domainBuilder } = require('../../../test-helper');
const CertificationDetails = require('../../../../lib/domain/read-models/CertificationDetails');
const { states } = require('../../../../lib/domain/models/CertificationAssessment');

describe('Unit | Domain | Read-models | CertificationDetails', () => {

  describe('static #from', () => {
    it('should return a CertificationDetails', () => {
      // given
      const certificationChallenge = domainBuilder.buildCertificationChallenge({ challengeId: 'rec123' });
      const answer = domainBuilder.buildAnswer({ challengeId: 'rec123' });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        id: 123,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-03-03'),
        state: states.COMPLETED,
        certificationChallenges: [certificationChallenge],
        certificationAnswersByDate: [answer],
      });
      const competenceMarks = [];
      const placementProfile = null;

      // when
      const certificationDetails = CertificationDetails.from({ certificationAssessment, placementProfile, competenceMarks });

      // then
      expect(certificationDetails.id).to.equal(123);
      expect(certificationDetails.userId).to.equal(456);
      expect(certificationDetails.createdAt).to.deep.equal(new Date('2020-01-01'));
      expect(certificationDetails.completedAt).to.deep.equal(new Date('2020-03-03'));
      expect(certificationDetails.status).to.equal(states.COMPLETED);
    });

    it('should return a totalScore which is the sum of competence marks score', () => {
      // given
      const certificationChallenge = domainBuilder.buildCertificationChallenge({ challengeId: 'rec123' });
      const answer = domainBuilder.buildAnswer({ challengeId: 'rec123' });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge],
        certificationAnswersByDate: [answer],
      });
      const competenceMark1 = domainBuilder.buildCompetenceMark({ competenceId: 'recComp1', score: 5 });
      const competenceMark2 = domainBuilder.buildCompetenceMark({ competenceId: 'recComp2', score: 8 });
      const competenceMarks = [competenceMark1, competenceMark2];
      const placementProfile = domainBuilder.buildPlacementProfile.buildForCompetences({
        competencesData: [
          { id: 'recComp1' },
          { id: 'recComp2' },
        ],
      });

      // when
      const certificationDetails = CertificationDetails.from({ certificationAssessment, placementProfile, competenceMarks });

      // then
      expect(certificationDetails.totalScore).to.equal(13);
    });

    it('should return a percentageCorrectAnswers using the reproducibility calculation', () => {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallenge({ challengeId: 'rec123' });
      const answer1 = domainBuilder.buildAnswer.ok({ challengeId: 'rec123' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallenge({ challengeId: 'rec456' });
      const answer2 = domainBuilder.buildAnswer.ko({ challengeId: 'rec456' });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1, certificationChallenge2],
        certificationAnswersByDate: [answer1, answer2],
      });
      const competenceMarks = [];
      const placementProfile = null;

      // when
      const certificationDetails = CertificationDetails.from({ certificationAssessment, placementProfile, competenceMarks });

      // then
      expect(certificationDetails.percentageCorrectAnswers).to.equal(50);
    });

    it('should create competencesWithMark', () => {
      // given
      const certificationChallenge = domainBuilder.buildCertificationChallenge({ challengeId: 'rec123' });
      const answer = domainBuilder.buildAnswer({ challengeId: 'rec123' });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge],
        certificationAnswersByDate: [answer],
      });
      const competenceMark1 = domainBuilder.buildCompetenceMark({ competenceId: 'recComp1', score: 5, level: 1, competence_code: '1.1', area_code: '1' });
      const competenceMark2 = domainBuilder.buildCompetenceMark({ competenceId: 'recComp2', score: 17, level: 2, competence_code: '2.2', area_code: '2' });
      const competenceMarks = [competenceMark1, competenceMark2];
      const placementProfile = domainBuilder.buildPlacementProfile.buildForCompetences({
        competencesData: [
          { id: 'recComp1', index: '1.1', name: 'Manger des fruits', level: 3, score: 45 },
          { id: 'recComp2', index: '2.2', name: 'Ranger sa chambre', level: 2, score: 18 },
        ],
      });

      // when
      const certificationDetails = CertificationDetails.from({ certificationAssessment, placementProfile, competenceMarks });

      // then
      expect(certificationDetails.competencesWithMark).to.deep.include.members([
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
      ]);
    });

    context('#listChallengesAndAnswers', () => {

      it('should create listChallengesAndAnswers', () => {
        // given
        const certificationChallenge1 = domainBuilder.buildCertificationChallenge({ challengeId: 'rec123', competenceId: 'recComp1', associatedSkillName: 'manger une mangue' });
        const answer1 = domainBuilder.buildAnswer.ok({ challengeId: 'rec123', value: 'prout' });
        const certificationChallenge2 = domainBuilder.buildCertificationChallenge({ challengeId: 'rec456', competenceId: 'recComp2', associatedSkillName: 'faire son lit' });
        const answer2 = domainBuilder.buildAnswer.ko({ challengeId: 'rec456', value: 'bidule' });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge1, certificationChallenge2],
          certificationAnswersByDate: [answer1, answer2],
        });
        const competenceMark1 = domainBuilder.buildCompetenceMark({ competenceId: 'recComp1', score: 5, level: 1, competence_code: '1.1', area_code: '1' });
        const competenceMark2 = domainBuilder.buildCompetenceMark({ competenceId: 'recComp2', score: 17, level: 2, competence_code: '2.2', area_code: '2' });
        const competenceMarks = [competenceMark1, competenceMark2];
        const placementProfile = domainBuilder.buildPlacementProfile.buildForCompetences({
          competencesData: [
            { id: 'recComp1', index: '1.1', name: 'Manger des fruits', level: 3, score: 45 },
            { id: 'recComp2', index: '2.2', name: 'Ranger sa chambre', level: 2, score: 18 },
          ],
        });

        // when
        const certificationDetails = CertificationDetails.from({ certificationAssessment, placementProfile, competenceMarks });

        // then
        expect(certificationDetails.listChallengesAndAnswers).to.deep.include.members([
          {
            challengeId: 'rec123',
            competence: '1.1',
            result: 'ok',
            skill: 'manger une mangue',
            value: 'prout',
          },
          {
            challengeId: 'rec456',
            competence: '2.2',
            result: 'ko',
            skill: 'faire son lit',
            value: 'bidule',
          },
        ]);
      });

      it('should ignore challenges that do not have answer', () => {
        // given
        const certificationChallenge1 = domainBuilder.buildCertificationChallenge({ challengeId: 'rec123', competenceId: 'recComp1', associatedSkillName: 'manger une mangue' });
        const answer1 = domainBuilder.buildAnswer.ok({ challengeId: 'rec123', value: 'prout' });
        const certificationChallenge2 = domainBuilder.buildCertificationChallenge({ challengeId: 'rec456', competenceId: 'recComp2', associatedSkillName: 'faire son lit' });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge1, certificationChallenge2],
          certificationAnswersByDate: [answer1],
        });
        const competenceMark1 = domainBuilder.buildCompetenceMark({ competenceId: 'recComp1', score: 5, level: 1, competence_code: '1.1', area_code: '1' });
        const competenceMark2 = domainBuilder.buildCompetenceMark({ competenceId: 'recComp2', score: 17, level: 2, competence_code: '2.2', area_code: '2' });
        const competenceMarks = [competenceMark1, competenceMark2];
        const placementProfile = domainBuilder.buildPlacementProfile.buildForCompetences({
          competencesData: [
            { id: 'recComp1', index: '1.1', name: 'Manger des fruits', level: 3, score: 45 },
            { id: 'recComp2', index: '2.2', name: 'Ranger sa chambre', level: 2, score: 18 },
          ],
        });

        // when
        const certificationDetails = CertificationDetails.from({ certificationAssessment, placementProfile, competenceMarks });

        // then
        expect(certificationDetails.listChallengesAndAnswers).to.deep.include.members([
          {
            challengeId: 'rec123',
            competence: '1.1',
            result: 'ok',
            skill: 'manger une mangue',
            value: 'prout',
          },
        ]);
      });
    });
  });
});
