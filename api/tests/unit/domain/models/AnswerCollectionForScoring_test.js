const { expect, domainBuilder } = require('../../../test-helper');
const AnswerCollectionForScoring = require('../../../../lib/domain/models/AnswerCollectionForScoring');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

describe('Unit | Domain | Models | AnswerCollectionForScoring', function() {

  context('#numberOfNonNeutralizedChallenges', () => {

    it('equals 0 when no challenges asked', () => {
      // given
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [],
        challenges: [],
      });

      // when
      const numberOfChallenges = answerCollection.numberOfNonNeutralizedChallenges();

      // then
      expect(numberOfChallenges).to.equal(0);
    });

    it('counts the number of non neutralized challenges', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ isNeutralized: true, challengeId: 'chal1', type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', type: 'QCM' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId });
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3],
        challenges: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfChallenges = answerCollection.numberOfNonNeutralizedChallenges();

      // then
      expect(numberOfChallenges).to.equal(2);
    });

    it('counts QROCMDeps as single challenges', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', type: 'QCM' });
      const qROCMDepChallenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', type: 'QROCM-dep' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const qROCMDepAnswer2 = domainBuilder.buildAnswer({ challengeId: qROCMDepChallenge2.challengeId });
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, qROCMDepAnswer2 ],
        challenges: [challenge1, qROCMDepChallenge2 ],
      });

      // when
      const numberOfChallenges = answerCollection.numberOfNonNeutralizedChallenges();

      // then
      expect(numberOfChallenges).to.equal(2);
    });

    it('counts answered as well as unanswered challenges indifferently', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', type: 'QCM' });
      const noAnswers = [];
      const answerCollection = AnswerCollectionForScoring.from({
        answers: noAnswers,
        challenges: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfChallenges = answerCollection.numberOfNonNeutralizedChallenges();

      // then
      expect(numberOfChallenges).to.equal(3);
    });
  });
  context('#numberOfCorrectAnswers', () => {

    it('equals 0 when no answers', () => {
      // given
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [],
        challenges: [],
      });

      // when
      const numberOfCorrectAnswers = answerCollection.numberOfCorrectAnswers();

      // then
      expect(numberOfCorrectAnswers).to.equal(0);
    });

    it('equals 0 when no correct answers', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', type: 'QCM' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.KO });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId, result: AnswerStatus.KO });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId, result: AnswerStatus.KO });
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3],
        challenges: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfCorrectAnswers = answerCollection.numberOfCorrectAnswers();

      // then
      expect(numberOfCorrectAnswers).to.equal(0);
    });

    it('equals the number of answers when they are all correct and non-neutralized', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', type: 'QCM', isNeutralized: false });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', type: 'QCM', isNeutralized: false });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', type: 'QCM', isNeutralized: false });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.OK });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId, result: AnswerStatus.OK });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId, result: AnswerStatus.OK });
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3],
        challenges: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfCorrectAnswers = answerCollection.numberOfCorrectAnswers();

      // then
      expect(numberOfCorrectAnswers).to.equal(3);
    });

    it('counts QROCMDeps as 0 when partially correct', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', type: 'QCM' });
      const qROCMDepChallenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', type: 'QROCM-dep' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.OK });
      const qROCMDepAnswer2 = domainBuilder.buildAnswer({ challengeId: qROCMDepChallenge2.challengeId, result: AnswerStatus.PARTIALLY });
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, qROCMDepAnswer2 ],
        challenges: [challenge1, qROCMDepChallenge2 ],
      });

      // when
      const numberOfCorrectAnswers = answerCollection.numberOfCorrectAnswers();

      // then
      expect(numberOfCorrectAnswers).to.equal(1);
    });

    it('counts QROCMDeps as 1 when fully correct', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', type: 'QCM' });
      const qROCMDepChallenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', type: 'QROCM-dep' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.OK });
      const qROCMDepAnswer2 = domainBuilder.buildAnswer({ challengeId: qROCMDepChallenge2.challengeId, result: AnswerStatus.OK });
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, qROCMDepAnswer2 ],
        challenges: [challenge1, qROCMDepChallenge2 ],
      });

      // when
      const numberOfCorrectAnswers = answerCollection.numberOfCorrectAnswers();

      // then
      expect(numberOfCorrectAnswers).to.equal(2);
    });

    it('count only non-neutralized challenges', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', type: 'QCM', isNeutralized: true });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', type: 'QCM', isNeutralized: true });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', type: 'QCM', isNeutralized: false });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.OK });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId, result: AnswerStatus.OK });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId, result: AnswerStatus.OK });
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3],
        challenges: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfChallengesAnswered = answerCollection.numberOfCorrectAnswers();

      // then
      expect(numberOfChallengesAnswered).to.equal(1);
    });
  });
});

function _buildDecoratedCertificationChallenge({ challengeId, type, isNeutralized }) {
  const challenge = domainBuilder.buildCertificationChallenge({ challengeId, isNeutralized });
  challenge.type = type; // TODO : CertificationChallenge are decorated with type in certification-result-service, find a better way.
  return challenge;
}
