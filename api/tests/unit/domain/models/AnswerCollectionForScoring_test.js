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
  context('#numberOfChallengesForCompetence', () => {
    it('equals 0 when no challenges asked for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', competenceId: aCompetenceId, type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: aCompetenceId, type: 'QCM' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId });
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3],
        challenges: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfChallenges = answerCollection.numberOfChallengesForCompetence(anotherCompetenceId);

      // then
      expect(numberOfChallenges).to.equal(0);
    });

    it('equals the number of challenges when no QROCMDep for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', competenceId: aCompetenceId, type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: aCompetenceId, type: 'QCM' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId });

      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM' });
      const challenge5 = _buildDecoratedCertificationChallenge({ challengeId: 'chal5', competenceId: anotherCompetenceId, type: 'QCM' });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId });
      const answer5 = domainBuilder.buildAnswer({ challengeId: challenge5.challengeId });
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3, answer4, answer5],
        challenges: [challenge1, challenge2, challenge3, challenge4, challenge5],
      });

      // when
      const numberOfChallenges = answerCollection.numberOfChallengesForCompetence(aCompetenceId);

      // then
      expect(numberOfChallenges).to.equal(3);
    });

    it('counts QROCMDeps as double if only two challenges or less for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM' });
      const qROCMDepChallenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', competenceId: aCompetenceId, type: 'QROCM-dep' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const qROCMDepAnswer2 = domainBuilder.buildAnswer({ challengeId: qROCMDepChallenge2.challengeId });

      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: anotherCompetenceId, type: 'QCM' });
      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM' });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId });

      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, qROCMDepAnswer2, answer3, answer4 ],
        challenges: [challenge1, qROCMDepChallenge2, challenge3, challenge4 ],
      });

      // when
      const numberOfChallenges = answerCollection.numberOfChallengesForCompetence(aCompetenceId);

      // then
      expect(numberOfChallenges).to.equal(3);
    });

    it('counts QROCMDeps as single if more than two challenges for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'cha2', competenceId: aCompetenceId, type: 'QCM' });
      const qROCMDepChallenge3 = _buildDecoratedCertificationChallenge({ competenceId: aCompetenceId, type: 'QROCM-dep' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const qROCMDepAnswer3 = domainBuilder.buildAnswer({ challengeId: qROCMDepChallenge3.challengeId });

      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM' });
      const challenge5 = _buildDecoratedCertificationChallenge({ challengeId: 'chal5', competenceId: anotherCompetenceId, type: 'QCM' });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId });
      const answer5 = domainBuilder.buildAnswer({ challengeId: challenge5.challengeId });

      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, qROCMDepAnswer3, answer4, answer5 ],
        challenges: [challenge1, challenge2, qROCMDepChallenge3, challenge4, challenge5 ],
      });

      // when
      const numberOfChallenges = answerCollection.numberOfChallengesForCompetence(aCompetenceId);

      // then
      expect(numberOfChallenges).to.equal(3);
    });

    it('counts answered as well as unanswered challenges indifferently for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', competenceId: aCompetenceId, type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: aCompetenceId, type: 'QCM' });

      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM' });
      const challenge5 = _buildDecoratedCertificationChallenge({ challengeId: 'chal5', competenceId: anotherCompetenceId, type: 'QCM' });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId });
      const answer5 = domainBuilder.buildAnswer({ challengeId: challenge5.challengeId });

      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer4, answer5],
        challenges: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfChallenges = answerCollection.numberOfChallengesForCompetence(aCompetenceId);

      // then
      expect(numberOfChallenges).to.equal(3);
    });
  });
  context('#numberOfCorrectAnswersForCompetence', () => {

    it('equals 0 when no answers for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', competenceId: aCompetenceId, type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: aCompetenceId, type: 'QCM' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId });
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3],
        challenges: [],
      });

      // when
      const numberOfCorrectAnswers = answerCollection.numberOfCorrectAnswersForCompetence(anotherCompetenceId);

      // then
      expect(numberOfCorrectAnswers).to.equal(0);
    });

    it('equals 0 when no correct answers for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', competenceId: aCompetenceId, type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: aCompetenceId, type: 'QCM' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.KO });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId, result: AnswerStatus.KO });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId, result: AnswerStatus.KO });

      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM' });
      const challenge5 = _buildDecoratedCertificationChallenge({ challengeId: 'chal5', competenceId: anotherCompetenceId, type: 'QCM' });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId });
      const answer5 = domainBuilder.buildAnswer({ challengeId: challenge5.challengeId });

      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3, answer4, answer5],
        challenges: [challenge1, challenge2, challenge3, challenge4, challenge5],
      });

      // when
      const numberOfCorrectAnswers = answerCollection.numberOfCorrectAnswersForCompetence(aCompetenceId);

      // then
      expect(numberOfCorrectAnswers).to.equal(0);
    });

    it('equals the number of answers when they are all correct for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', competenceId: aCompetenceId, type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: aCompetenceId, type: 'QCM' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.OK });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId, result: AnswerStatus.OK });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId, result: AnswerStatus.OK });

      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM' });
      const challenge5 = _buildDecoratedCertificationChallenge({ challengeId: 'chal5', competenceId: anotherCompetenceId, type: 'QCM' });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId });
      const answer5 = domainBuilder.buildAnswer({ challengeId: challenge5.challengeId });

      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3, answer4, answer5],
        challenges: [challenge1, challenge2, challenge3, challenge4, challenge5],
      });

      // when
      const numberOfCorrectAnswers = answerCollection.numberOfCorrectAnswersForCompetence(aCompetenceId);

      // then
      expect(numberOfCorrectAnswers).to.equal(3);
    });

    it('counts QROCMDeps as 1 when partially correctfor given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM' });
      const qROCMDepChallenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', competenceId: aCompetenceId, type: 'QROCM-dep' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.OK });
      const qROCMDepAnswer2 = domainBuilder.buildAnswer({ challengeId: qROCMDepChallenge2.challengeId, result: AnswerStatus.PARTIALLY });

      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: anotherCompetenceId, type: 'QCM' });
      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM' });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId, result: AnswerStatus.KO });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId, result: AnswerStatus.KO });

      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, qROCMDepAnswer2, answer3, answer4 ],
        challenges: [challenge1, qROCMDepChallenge2, challenge3, challenge4 ],
      });

      // when
      const numberOfCorrectAnswers = answerCollection.numberOfCorrectAnswersForCompetence(aCompetenceId);

      // then
      expect(numberOfCorrectAnswers).to.equal(2);
    });

    it('counts QROCMDeps as 2 when fully correctfor given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM' });
      const qROCMDepChallenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', competenceId: aCompetenceId, type: 'QROCM-dep' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.OK });
      const qROCMDepAnswer2 = domainBuilder.buildAnswer({ challengeId: qROCMDepChallenge2.challengeId, result: AnswerStatus.OK });

      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: anotherCompetenceId, type: 'QCM' });
      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM' });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId, result: AnswerStatus.KO });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId, result: AnswerStatus.KO });

      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, qROCMDepAnswer2, answer3, answer4 ],
        challenges: [challenge1, qROCMDepChallenge2, challenge3, challenge4 ],
      });

      // when
      const numberOfCorrectAnswers = answerCollection.numberOfCorrectAnswersForCompetence(aCompetenceId);

      // then
      expect(numberOfCorrectAnswers).to.equal(3);
    });

    it('count only non-neutralized challenges for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM', isNeutralized: true });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', competenceId: aCompetenceId, type: 'QCM', isNeutralized: true });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: aCompetenceId, type: 'QCM', isNeutralized: false });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId, result: AnswerStatus.OK });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId, result: AnswerStatus.OK });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId, result: AnswerStatus.OK });

      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM', isNeutralized: false });
      const challenge5 = _buildDecoratedCertificationChallenge({ challengeId: 'chal5', competenceId: anotherCompetenceId, type: 'QCM', isNeutralized: false });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId });
      const answer5 = domainBuilder.buildAnswer({ challengeId: challenge5.challengeId });

      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3, answer4, answer5],
        challenges: [challenge1, challenge2, challenge3, challenge4, challenge5],
      });

      // when
      const numberOfChallengesAnswered = answerCollection.numberOfCorrectAnswersForCompetence(aCompetenceId);

      // then
      expect(numberOfChallengesAnswered).to.equal(1);
    });
  });
  context('#numberOfNeutralizedChallengesForCompetence', () => {

    it('equals 0 when there are no answers for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'chal1', competenceId: aCompetenceId, type: 'QCM' });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'chal2', competenceId: aCompetenceId, type: 'QCM' });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: aCompetenceId, type: 'QCM' });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId });
      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3],
        challenges: [challenge1, challenge2, challenge3],
      });

      // when
      const numberOfNeutralizedChallenges = answerCollection.numberOfNeutralizedChallengesForCompetence(anotherCompetenceId);

      // then
      expect(numberOfNeutralizedChallenges).to.equal(0);
    });

    it('equals the number of challenges when there are all neutralized and none of them are QROCMDep for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ type: 'QCM', competenceId: aCompetenceId, isNeutralized: true });
      const challenge2 = _buildDecoratedCertificationChallenge({ type: 'QCM', competenceId: aCompetenceId, isNeutralized: true });
      const challenge3 = _buildDecoratedCertificationChallenge({ type: 'QCM', competenceId: aCompetenceId, isNeutralized: true });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId });

      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM' });
      const challenge5 = _buildDecoratedCertificationChallenge({ challengeId: 'chal5', competenceId: anotherCompetenceId, type: 'QCM' });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId });
      const answer5 = domainBuilder.buildAnswer({ challengeId: challenge5.challengeId });

      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3, answer4, answer5],
        challenges: [challenge1, challenge2, challenge3, challenge4, challenge5],
      });

      // when
      const numberOfNeutralizedChallenges = answerCollection.numberOfNeutralizedChallengesForCompetence(aCompetenceId);

      // then
      expect(numberOfNeutralizedChallenges).to.equal(3);
    });

    it('counts a neutralized QROCMDep challenge as two neutralized challenges when less than 3 challenges for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'rec1234', competenceId: aCompetenceId, type: 'QCM', isNeutralized: true });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'rec456', competenceId: aCompetenceId, type: 'QROCM-dep', isNeutralized: true });
      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });

      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'chal3', competenceId: anotherCompetenceId, type: 'QCM' });
      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM' });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId, result: AnswerStatus.KO });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId, result: AnswerStatus.KO });

      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3, answer4],
        challenges: [challenge1, challenge2, challenge3, challenge4],
      });

      // when
      const numberOfNeutralizedChallenges = answerCollection.numberOfNeutralizedChallengesForCompetence(aCompetenceId);

      // then
      expect(numberOfNeutralizedChallenges).to.equal(3);
    });

    it('counts a neutralized QROCMDep challenge as a single neutralized challenge when 3 challenges for given competence', () => {
      // given
      const aCompetenceId = 'recIdOfACompetence';
      const anotherCompetenceId = 'recIdOfAnotherCompetence';
      const challenge1 = _buildDecoratedCertificationChallenge({ challengeId: 'rec1234', competenceId: aCompetenceId, type: 'QCM', isNeutralized: true });
      const challenge2 = _buildDecoratedCertificationChallenge({ challengeId: 'rec456', competenceId: aCompetenceId, type: 'QROCM-dep', isNeutralized: true });
      const challenge3 = _buildDecoratedCertificationChallenge({ challengeId: 'rec789', competenceId: aCompetenceId, type: 'QCM', isNeutralized: true });

      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.challengeId });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.challengeId });
      const answer3 = domainBuilder.buildAnswer({ challengeId: challenge3.challengeId });

      const challenge4 = _buildDecoratedCertificationChallenge({ challengeId: 'chal4', competenceId: anotherCompetenceId, type: 'QCM' });
      const challenge5 = _buildDecoratedCertificationChallenge({ challengeId: 'chal5', competenceId: anotherCompetenceId, type: 'QCM' });
      const answer4 = domainBuilder.buildAnswer({ challengeId: challenge4.challengeId });
      const answer5 = domainBuilder.buildAnswer({ challengeId: challenge5.challengeId });

      const answerCollection = AnswerCollectionForScoring.from({
        answers: [answer1, answer2, answer3, answer4, answer5],
        challenges: [challenge1, challenge2, challenge3, challenge4, challenge5],
      });

      // when
      const numberOfNeutralizedChallenges = answerCollection.numberOfNeutralizedChallengesForCompetence(aCompetenceId);

      // then
      expect(numberOfNeutralizedChallenges).to.equal(3);
    });
  });
});

function _buildDecoratedCertificationChallenge({ challengeId, type, isNeutralized, competenceId }) {
  const challenge = domainBuilder.buildCertificationChallenge({ challengeId, isNeutralized, competenceId });
  challenge.type = type; // TODO : CertificationChallenge are decorated with type in certification-result-service, find a better way.
  return challenge;
}
