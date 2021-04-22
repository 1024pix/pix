const { expect, domainBuilder } = require('../../../test-helper');
const CompetenceAnswerCollectionForScoring = require('../../../../lib/domain/models/CompetenceAnswerCollectionForScoring');

describe('Unit | Domain | Models | CompetenceAnswerCollectionForScoring', function() {

  context('#numberOfNeutralizedChallenges', () => {

    it('equals 0 when there are no answers', () => {
      // given
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [],
        challengesForCompetence: [],
      });

      // when
      const numberOfNeutralizedChallenges = answerCollection.numberOfNeutralizedChallenges();

      // then
      expect(numberOfNeutralizedChallenges).to.equal(0);
    });

    it('equals the number of challenges when there are all neutralized and none of them are QROCMDep', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ type: 'QCM', isNeutralized: true });
      const challenge2 = _buildDecoratedCertificationChallenge({ type: 'QCM', isNeutralized: true });
      const challenge3 = _buildDecoratedCertificationChallenge({ type: 'QCM', isNeutralized: true });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId });
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [answer1, answer2, answer3],
        challengesForCompetence: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfNeutralizedChallenges = answerCollection.numberOfNeutralizedChallenges();

      // then
      expect(numberOfNeutralizedChallenges).to.equal(3);
    });

    it('counts a neutralized QROCMDep challenge as two neutralized challenges when less than 3 challenges', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'rec1234', type: 'QCM', isNeutralized: true });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'rec456', type: 'QROCM-dep', isNeutralized: true });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [answer1, answer2],
        challengesForCompetence: [challenge1, challenge2],
      });

      // when
      const numberOfNeutralizedChallenges = answerCollection.numberOfNeutralizedChallenges();

      // then
      expect(numberOfNeutralizedChallenges).to.equal(3);
    });

    it('counts a neutralized QROCMDep challenge as a single neutralized challenge when 3 challenges', () => {
      // given
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'rec1234', type: 'QCM', isNeutralized: true });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'rec456', type: 'QROCM-dep', isNeutralized: true });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'rec789', type: 'QCM', isNeutralized: true });

      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId });
      const answerCollection = CompetenceAnswerCollectionForScoring.from({
        answersForCompetence: [answer1, answer2, answer3],
        challengesForCompetence: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfNeutralizedChallenges = answerCollection.numberOfNeutralizedChallenges();

      // then
      expect(numberOfNeutralizedChallenges).to.equal(3);
    });
  });
});

function _buildDecoratedCertificationChallenge({ challengeId, type, isNeutralized }) {
  const challenge = domainBuilder.buildCertificationChallenge({ challengeId, isNeutralized });
  challenge.type = type; // TODO : CertificationChallenge are decorated with type in certification-result-service, find a better way.
  return challenge;
}
