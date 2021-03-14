const { expect, domainBuilder } = require('../../../test-helper');
const CompetenceAnswerCollectionForScoring = require('../../../../lib/domain/models/CompetenceAnswerCollectionForScoring');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

describe('Unit | Domain | Models | CompetenceAnswerCollectionForScoring', function() {
  context('#numberOfAnsweredChallenges', () => {
    it('equals 0 when no answers', () => {
      // given
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [],
        challengesForCompetence: [],
      });

      // when
      const numberOfChallengesAnswered = answerCollection.numberOfChallengesAnswered();

      // then
      expect(numberOfChallengesAnswered).to.equal(0);
    });

    it('equals the number of challenges when no QROCMDep', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId });
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [answer1, answer2, answer3],
        challengesForCompetence: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfChallengesAnswered = answerCollection.numberOfChallengesAnswered();

      // then
      expect(numberOfChallengesAnswered).to.equal(3);
    });

    it('counts QROCMDeps as double ', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const qROCMDepChallenge2 = _buildDecoratedCertificationChallenge({ type: 'QROCM-dep' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const qROCMDepAnswer2 = domainBuilder.buildAnswer({ challengeId: qROCMDepChallenge2.challengeId });
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [answer1, qROCMDepAnswer2 ],
        challengesForCompetence: [challenge1, qROCMDepChallenge2 ],
      });

      // when
      const numberOfChallengesAnswered = answerCollection.numberOfChallengesAnswered();

      // then
      expect(numberOfChallengesAnswered).to.equal(3);
    });
  });
  context('#numberOfCorrectAnswers', () => {
    it('equals 0 when no answers', () => {
      // given
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [],
        challengesForCompetence: [],
      });

      // when
      const numberOfChallengesAnswered = answerCollection.numberOfCorrectAnswers();

      // then
      expect(numberOfChallengesAnswered).to.equal(0);
    });

    it('equals 0 when no correct answers', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.KO });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId, result: AnswerStatus.KO });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId, result: AnswerStatus.KO });
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [answer1, answer2, answer3],
        challengesForCompetence: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfChallengesAnswered = answerCollection.numberOfCorrectAnswers();

      // then
      expect(numberOfChallengesAnswered).to.equal(0);
    });

    it('equals the number of answers when they are all correct', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.OK });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId, result: AnswerStatus.OK });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId, result: AnswerStatus.OK });
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [answer1, answer2, answer3],
        challengesForCompetence: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfChallengesAnswered = answerCollection.numberOfCorrectAnswers();

      // then
      expect(numberOfChallengesAnswered).to.equal(3);
    });

    it('counts QROCMDeps as 1 when partially correct', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const qROCMDepChallenge2 = _buildDecoratedCertificationChallenge({ type: 'QROCM-dep' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.OK });
      const qROCMDepAnswer2 = domainBuilder.buildAnswer({ challengeId: qROCMDepChallenge2.challengeId, result: AnswerStatus.PARTIALLY });
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [answer1, qROCMDepAnswer2 ],
        challengesForCompetence: [challenge1, qROCMDepChallenge2 ],
      });

      // when
      const numberOfChallengesAnswered = answerCollection.numberOfCorrectAnswers();

      // then
      expect(numberOfChallengesAnswered).to.equal(2);
    });

    it('counts QROCMDeps as 2 when fully correct', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ type: 'QCM' });
      const qROCMDepChallenge2 = _buildDecoratedCertificationChallenge({ type: 'QROCM-dep' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.OK });
      const qROCMDepAnswer2 = domainBuilder.buildAnswer({ challengeId: qROCMDepChallenge2.challengeId, result: AnswerStatus.OK });
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [answer1, qROCMDepAnswer2 ],
        challengesForCompetence: [challenge1, qROCMDepChallenge2 ],
      });

      // when
      const numberOfChallengesAnswered = answerCollection.numberOfCorrectAnswers();

      // then
      expect(numberOfChallengesAnswered).to.equal(3);
    });
  });
});

function _buildDecoratedCertificationChallenge({ type }) {
  const challenge = domainBuilder.buildCertificationChallenge();
  challenge.type = type; // TODO : CertificationChallenge are decorated with type in certification-result-service, find a better way.
  return challenge;
}
