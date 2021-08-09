const { expect, domainBuilder } = require('../../../test-helper');
const CertificationGlobalScoring = require('../../../../lib/domain/models/CertificationGlobalScoring');
const AnswerCollectionForScoring = require('../../../../lib/domain/models/AnswerCollectionForScoring');
const times = require('lodash/times');

describe('Unit | Domain | Models | CertificationGlobalScoring', () => {

  context('#static from', () => {

    context('neutralization rate', () => {

      it('set the rate to 0% when there is no answer', () => {
        // given
        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers: [],
          challenges: [],
        });
        const testedCompetences = [];

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.challengeNeutralizationRate).to.equal(0);
      });

      it('set the rate to 0% when there is no neutralized challenge', () => {
        // given
        const answers = _buildAnswers({ count: 3 });
        const challenges = _buildChallenges({ count: 3 });

        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers,
          challenges,
        });
        const testedCompetences = new Array(1);

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.challengeNeutralizationRate).to.equal(0);
      });

      it('set the rate to 33% when there is one neutralized challenge in three challenges', () => {
        // given
        const answers = _buildAnswers({ count: 3 });
        const challenges = _buildChallenges({ count: 3, numberOfNeutralized: 1 });

        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers,
          challenges,
        });
        const testedCompetences = new Array(1);

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.challengeNeutralizationRate).to.equal(33);
      });

      it('set the rate to 50% when there is three neutralized challenge in six challenges', () => {
        // given
        const answers = _buildAnswers({ count: 6 });
        const challenges = _buildChallenges({ count: 6, numberOfNeutralized: 3 });

        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers,
          challenges,
        });
        const testedCompetences = new Array(2);

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.challengeNeutralizationRate).to.equal(50);
      });
    });

    context('answered challenges rate', () => {

      it('set the rate to 0% when there is no challenge', () => {
        // given
        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers: [],
          challenges: [],
        });
        const testedCompetences = [];

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.answeredChallengesRate).to.equal(0);
      });

      it('set the rate to 0% when there is no answers', () => {
        // given
        const challenges = _buildChallenges({ count: 3 });

        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers: [],
          challenges,
        });
        const testedCompetences = new Array(1);

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.answeredChallengesRate).to.equal(0);
      });

      it('set the rate to 33% when there is one answer for three challenges', () => {
        // given
        const answers = _buildAnswers({ count: 1 });
        const challenges = _buildChallenges({ count: 3 });

        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers,
          challenges,
        });
        const testedCompetences = new Array(1);

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.answeredChallengesRate).to.equal(33);
      });

      it('set the rate to 50% when there is three answers for six challenges', () => {
        // given
        const answers = _buildAnswers({ count: 3 });
        const challenges = _buildChallenges({ count: 6 });
        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers,
          challenges,
        });
        const testedCompetences = new Array(2);

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.answeredChallengesRate).to.equal(50);
      });
    });

    context('proposition rate', () => {

      it('set the rate to 0% when there is no tested competence', () => {
        // given
        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers: [],
          challenges: [],
        });
        const testedCompetences = [];

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.challengePropositionRate).to.equal(0);
      });

      it('set the rate to 0% when there is no challenges', () => {
        // given
        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers: [],
          challenges: [],
        });
        const testedCompetences = new Array(1);

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.challengePropositionRate).to.equal(0);
      });

      it('set the rate to 33% when there is one challenge for one tested competence', () => {
        // given
        const answers = _buildAnswers({ count: 1 });
        const challenges = _buildChallenges({ count: 1 });

        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers,
          challenges,
        });
        const testedCompetences = new Array(1);

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.challengePropositionRate).to.equal(33);
      });

      it('set the rate to 50% when there is three challenges for two tested competences', () => {
        // given
        const answers = _buildAnswers({ count: 3 });
        const challenges = _buildChallenges({ count: 3 });
        const answerCollectionForScoring = AnswerCollectionForScoring.from({
          answers,
          challenges,
        });
        const testedCompetences = new Array(2);

        // when
        const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

        // then
        expect(globalScoring.challengePropositionRate).to.equal(50);
      });
    });
  });

  context('#shouldCancelCertification', () => {

    it('returns false when challenge neutralization rate < 33%', () => {
      // given
      const answers = _buildAnswers({ count: 6 });
      const challenges = _buildChallenges({ count: 6, numberOfNeutralized: 1 });

      const answerCollectionForScoring = AnswerCollectionForScoring.from({
        answers,
        challenges,
      });
      const testedCompetences = new Array(2);

      const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

      // when
      const shouldCancelCertification = globalScoring.hasFailed();

      // then
      expect(shouldCancelCertification).to.be.false;
    });

    it('returns false when challenge neutralization rate = 33%', () => {
      // given
      const answers = _buildAnswers({ count: 3 });
      const challenges = _buildChallenges({ count: 3, numberOfNeutralized: 1 });

      const answerCollectionForScoring = AnswerCollectionForScoring.from({
        answers,
        challenges,
      });
      const testedCompetences = new Array(1);

      const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

      // when
      const shouldCancelCertification = globalScoring.hasFailed();

      // then
      expect(shouldCancelCertification).to.be.false;
    });

    it('returns true when challenge neutralization rate > 33%', () => {
      // given
      const answers = _buildAnswers({ count: 3 });
      const challenges = _buildChallenges({ count: 3, numberOfNeutralized: 2 });

      const answerCollectionForScoring = AnswerCollectionForScoring.from({
        answers,
        challenges,
      });
      const testedCompetences = new Array(1);

      const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

      // when
      const shouldCancelCertification = globalScoring.hasFailed();

      // then
      expect(shouldCancelCertification).to.be.true;
    });

    it('returns true when answered challenges rate < 33%', () => {
      // given
      const answers = _buildAnswers({ count: 1 });
      const challenges = _buildChallenges({ count: 6 });

      const answerCollectionForScoring = AnswerCollectionForScoring.from({
        answers,
        challenges,
      });
      const testedCompetences = new Array(2);

      const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

      // when
      const shouldCancelCertification = globalScoring.hasFailed();

      // then
      expect(shouldCancelCertification).to.be.true;
    });

    it('returns false when answered challenges rate = 33%', () => {
      // given
      const answers = _buildAnswers({ count: 1 });
      const challenges = _buildChallenges({ count: 3 });

      const answerCollectionForScoring = AnswerCollectionForScoring.from({
        answers,
        challenges,
      });
      const testedCompetences = new Array(1);

      const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

      // when
      const shouldCancelCertification = globalScoring.hasFailed();

      // then
      expect(shouldCancelCertification).to.be.false;
    });

    it('returns false when answered challenges rate > 33%', () => {
      // given
      const answers = _buildAnswers({ count: 2 });
      const challenges = _buildChallenges({ count: 3 });

      const answerCollectionForScoring = AnswerCollectionForScoring.from({
        answers,
        challenges,
      });
      const testedCompetences = new Array(1);

      const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

      // when
      const shouldCancelCertification = globalScoring.hasFailed();

      // then
      expect(shouldCancelCertification).to.be.false;
    });

    it('returns true when challenge proposition rate < 33%', () => {
      // given
      const answers = _buildAnswers({ count: 1 });
      const challenges = _buildChallenges({ count: 1 });

      const answerCollectionForScoring = AnswerCollectionForScoring.from({
        answers,
        challenges,
      });
      const testedCompetences = new Array(2);

      const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

      // when
      const shouldCancelCertification = globalScoring.hasFailed();

      // then
      expect(shouldCancelCertification).to.be.true;
    });

    it('returns false when challenge proposition rate = 33%', () => {
      // given
      const answers = _buildAnswers({ count: 1 });
      const challenges = _buildChallenges({ count: 1 });

      const answerCollectionForScoring = AnswerCollectionForScoring.from({
        answers,
        challenges,
      });
      const testedCompetences = new Array(1);

      const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

      // when
      const shouldCancelCertification = globalScoring.hasFailed();

      // then
      expect(shouldCancelCertification).to.be.false;
    });

    it('returns false when challenge proposition rate > 33%', () => {
      // given
      const answers = _buildAnswers({ count: 2 });
      const challenges = _buildChallenges({ count: 2 });

      const answerCollectionForScoring = AnswerCollectionForScoring.from({
        answers,
        challenges,
      });
      const testedCompetences = new Array(1);

      const globalScoring = CertificationGlobalScoring.from({ answerCollectionForScoring, testedCompetences });

      // when
      const shouldCancelCertification = globalScoring.hasFailed();

      // then
      expect(shouldCancelCertification).to.be.false;
    });
  });

  function _buildAnswers({ count }) {
    return times(count, (index) => domainBuilder.buildAnswer({ challengeId: `challenge_${index}` }));
  }

  function _buildChallenges({ count, numberOfNeutralized }) {
    let remainingNeutralizedChallenges = numberOfNeutralized;
    return times(count, (index) => {
      const isNeutralized = remainingNeutralizedChallenges > 0;
      remainingNeutralizedChallenges--;
      return domainBuilder.buildCertificationChallenge({ challengeId: `challenge_${index}`, isNeutralized });
    });
  }
});
