const _ = require('lodash');
const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const NeutralizationAttempt = require('../../../../lib/domain/models/NeutralizationAttempt');
const { expect, domainBuilder } = require('../../../test-helper');
const {
  ObjectValidationError,
  ChallengeToBeNeutralizedNotFoundError,
  ChallengeToBeDeneutralizedNotFoundError,
} = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | CertificationAssessment', function () {
  describe('constructor', function () {
    let validArguments;
    beforeEach(function () {
      validArguments = {
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: ['challenge'],
        certificationAnswersByDate: ['answer'],
      };
    });

    it('should successfully instantiate object when passing all valid arguments', function () {
      // when
      expect(() => new CertificationAssessment(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when id is not valid', function () {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, id: 'coucou' })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when userId is not valid', function () {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, userId: 'les zouzous' })).to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when certificationCourseId is not valid', function () {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, certificationCourseId: 'ça gaze ?' })).to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when createdAt is not valid', function () {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, createdAt: 'coucou' })).to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when completed is not valid', function () {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, completedAt: 'ça pétille !' })).to.throw(
        ObjectValidationError
      );
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    _.forIn(CertificationAssessment.states, (value) => {
      it(`should not throw an ObjectValidationError when state is ${value}`, function () {
        // when
        expect(() => new CertificationAssessment({ ...validArguments, state: value })).not.to.throw(
          ObjectValidationError
        );
      });
    });

    it('should throw an ObjectValidationError when status is not one of [completed, started]', function () {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, state: 'aborted' })).to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when isV2Certification is not valid', function () {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, isV2Certification: 'glouglou' })).to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when certificationChallenges is not valid', function () {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, certificationChallenges: [] })).to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when certificationAnswersByDate is not valid', function () {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, certificationAnswersByDate: 'glouglou' })).to.throw(
        ObjectValidationError
      );
    });

    it('should be valid when certificationAnswersByDate has no answer', function () {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, certificationAnswersByDate: [] })).not.to.throw(
        ObjectValidationError
      );
    });
  });

  describe('#getCertificationChallenge', function () {
    it('returns the challenge for the given challengeId', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec1234' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec456' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1, certificationChallenge2],
      });

      // when
      const certificationChallenge = certificationAssessment.getCertificationChallenge('rec1234');

      // then
      expect(certificationChallenge).to.deep.equal(certificationChallenge1);
    });

    it('returns null if no certification challenge exists for challengeId', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec1234' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec456' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1, certificationChallenge2],
      });

      // when
      const certificationChallenge = certificationAssessment.getCertificationChallenge('wrongId');

      // then
      expect(certificationChallenge).to.be.null;
    });
  });

  describe('#neutralizeChallengeByRecId', function () {
    it('neutralizes the challenge when the challenge was asked', function () {
      // given
      const challengeToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec1',
        isNeutralized: false,
      });

      const certificationAssessment = new CertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: [
          challengeToBeNeutralized,
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec2', isNeutralized: false }),
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec3', isNeutralized: false }),
        ],
        certificationAnswersByDate: ['answer'],
      });

      // when
      certificationAssessment.neutralizeChallengeByRecId(challengeToBeNeutralized.challengeId);

      // then
      expect(certificationAssessment.certificationChallenges[0].isNeutralized).to.be.true;
      expect(certificationAssessment.certificationChallenges[1].isNeutralized).to.be.false;
      expect(certificationAssessment.certificationChallenges[2].isNeutralized).to.be.false;
    });

    it('throws when the challenge was not asked', async function () {
      // given
      const challengeNotAskedToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec1',
        isNeutralized: false,
      });

      const certificationAssessment = new CertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec2', isNeutralized: false }),
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec3', isNeutralized: false }),
        ],
        certificationAnswersByDate: ['answer'],
      });

      // when / then
      expect(() => {
        certificationAssessment.neutralizeChallengeByRecId(challengeNotAskedToBeNeutralized.challengeId);
      }).to.throw(ChallengeToBeNeutralizedNotFoundError);
    });
  });

  describe('#deneutralizeChallengeByRecId', function () {
    it('deneutralizes the challenge when the challenge was asked', function () {
      // given
      const challengeToBeDeneutralized = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec1',
        isNeutralized: true,
      });

      const certificationAssessment = new CertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: [
          challengeToBeDeneutralized,
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec2', isNeutralized: true }),
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec3', isNeutralized: true }),
        ],
        certificationAnswersByDate: ['answer'],
      });

      // when
      certificationAssessment.deneutralizeChallengeByRecId(challengeToBeDeneutralized.challengeId);

      // then
      expect(certificationAssessment.certificationChallenges[0].isNeutralized).to.be.false;
      expect(certificationAssessment.certificationChallenges[1].isNeutralized).to.be.true;
      expect(certificationAssessment.certificationChallenges[2].isNeutralized).to.be.true;
    });

    it('throws when the challenge was not asked', async function () {
      // given
      const challengeNotAskedToBeDeneutralized = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec1',
        isNeutralized: false,
      });

      const certificationAssessment = new CertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec2', isNeutralized: false }),
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec3', isNeutralized: false }),
        ],
        certificationAnswersByDate: ['answer'],
      });

      // when / then
      expect(() => {
        certificationAssessment.deneutralizeChallengeByRecId(challengeNotAskedToBeDeneutralized.challengeId);
      }).to.throw(ChallengeToBeDeneutralizedNotFoundError);
    });
  });

  describe('#neutralizeChallengeByNumberIfKoOrSkippedOrPartially', function () {
    it('should neutralize the challenge when the answer is ko', function () {
      // given
      const challengeKoToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec1',
        isNeutralized: false,
      });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: [challengeKoToBeNeutralized],
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({
            challengeId: challengeKoToBeNeutralized.challengeId,
            result: AnswerStatus.KO.status,
            assessmentId: CertificationAssessment.id,
          }),
        ],
      });

      // when
      const neutralizationAttempt = certificationAssessment.neutralizeChallengeByNumberIfKoOrSkippedOrPartially(1);

      // then
      expect(challengeKoToBeNeutralized.isNeutralized).to.be.true;
      expect(neutralizationAttempt).to.deep.equal(NeutralizationAttempt.neutralized(1));
    });

    it('should neutralize the challenge when the answer is skipped', function () {
      // given
      const challengeSkippedToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec3',
        isNeutralized: false,
      });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: [challengeSkippedToBeNeutralized],
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({
            challengeId: challengeSkippedToBeNeutralized.challengeId,
            result: AnswerStatus.SKIPPED.status,
            assessmentId: CertificationAssessment.id,
          }),
        ],
      });

      // when
      const neutralizationAttempt = certificationAssessment.neutralizeChallengeByNumberIfKoOrSkippedOrPartially(1);

      // then
      expect(challengeSkippedToBeNeutralized.isNeutralized).to.be.true;
      expect(neutralizationAttempt).to.deep.equal(NeutralizationAttempt.neutralized(1));
    });

    it('should neutralize the challenge when the answer is partially answered', function () {
      // given
      const challengeSkippedToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec3',
        isNeutralized: false,
      });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: [challengeSkippedToBeNeutralized],
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({
            challengeId: challengeSkippedToBeNeutralized.challengeId,
            result: AnswerStatus.PARTIALLY.status,
            assessmentId: CertificationAssessment.id,
          }),
        ],
      });

      // when
      const neutralizationAttempt = certificationAssessment.neutralizeChallengeByNumberIfKoOrSkippedOrPartially(1);

      // then
      expect(challengeSkippedToBeNeutralized.isNeutralized).to.be.true;
      expect(neutralizationAttempt).to.deep.equal(NeutralizationAttempt.neutralized(1));
    });

    it('should not neutralize the challenge when the answer is neither skipped nor ko nor partially', function () {
      // given
      const challengeNotToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec3',
        isNeutralized: false,
      });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: [challengeNotToBeNeutralized],
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({
            challengeId: challengeNotToBeNeutralized.challengeId,
            result: AnswerStatus.OK.status,
            assessmentId: CertificationAssessment.id,
          }),
        ],
      });

      // when
      const neutralizationAttempt = certificationAssessment.neutralizeChallengeByNumberIfKoOrSkippedOrPartially(1);

      // then
      expect(challengeNotToBeNeutralized.isNeutralized).to.be.false;
      expect(neutralizationAttempt).to.deep.equal(NeutralizationAttempt.skipped(1));
    });

    it('should fail when the challenge is not asked', async function () {
      // given
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec2', isNeutralized: false }),
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec3', isNeutralized: false }),
        ],
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({
            challengeId: 'rec2',
            result: AnswerStatus.KO.status,
            assessmentId: CertificationAssessment.id,
          }),
          domainBuilder.buildAnswer({
            challengeId: 'rec3',
            result: AnswerStatus.KO.status,
            assessmentId: CertificationAssessment.id,
          }),
        ],
      });

      // when
      const neutralizationAttempt = certificationAssessment.neutralizeChallengeByNumberIfKoOrSkippedOrPartially(66);

      // then
      expect(neutralizationAttempt).to.deep.equal(NeutralizationAttempt.failure(66));
    });
  });

  describe('#listCertifiableBadgeKeysTaken', function () {
    it('returns the certifiable badge keys of those taken during this certification', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: 'BADGE_2',
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal2',
        certifiableBadgeKey: 'BADGE_1',
      });
      const certificationChallenge3 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal3',
        certifiableBadgeKey: 'BADGE_2',
      });
      const certificationChallenge4 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal4',
        certifiableBadgeKey: null,
      });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [
          certificationChallenge1,
          certificationChallenge2,
          certificationChallenge3,
          certificationChallenge4,
        ],
      });

      // when
      const certifiableBadgeKeys = certificationAssessment.listCertifiableBadgePixPlusKeysTaken();

      // then
      expect(certifiableBadgeKeys).to.deep.include.members(['BADGE_2', 'BADGE_1']);
      expect(certifiableBadgeKeys).to.have.lengthOf(2);
    });

    it('returns an empty array if no certifiable badge exam was taken', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: null,
      });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1],
      });

      // when
      const certifiableBadgeKeys = certificationAssessment.listCertifiableBadgePixPlusKeysTaken();

      // then
      expect(certifiableBadgeKeys).to.be.empty;
    });
  });

  describe('#findAnswersAndChallengesForCertifiableBadgeKey', function () {
    it('returns the answers and challenges for a certifiableBadgeKey', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: 'BADGE_1',
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal2',
        certifiableBadgeKey: 'BADGE_2',
      });
      const certificationChallenge3 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal3',
        certifiableBadgeKey: 'BADGE_1',
      });
      const certificationChallenge4 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal4',
        certifiableBadgeKey: null,
      });
      const certificationAnswer1 = domainBuilder.buildAnswer({ challengeId: 'chal1' });
      const certificationAnswer2 = domainBuilder.buildAnswer({ challengeId: 'chal2' });
      const certificationAnswer3 = domainBuilder.buildAnswer({ challengeId: 'chal3' });
      const certificationAnswer4 = domainBuilder.buildAnswer({ challengeId: 'chal4' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [
          certificationChallenge1,
          certificationChallenge2,
          certificationChallenge3,
          certificationChallenge4,
        ],
        certificationAnswersByDate: [
          certificationAnswer1,
          certificationAnswer2,
          certificationAnswer3,
          certificationAnswer4,
        ],
      });

      // when
      const { certificationChallenges, certificationAnswers } =
        certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey('BADGE_1');

      // then
      expect(certificationAnswers).to.deep.equals([certificationAnswer1, certificationAnswer3]);
      expect(certificationChallenges).to.deep.equals([certificationChallenge1, certificationChallenge3]);
    });

    it('returns empty arrays if there are no answers nor challenges for given key', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: 'BADGE_1',
      });
      const certificationAnswer1 = domainBuilder.buildAnswer({ challengeId: 'chal1' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1],
        certificationAnswersByDate: [certificationAnswer1],
      });

      // when
      const { certificationChallenges, certificationAnswers } =
        certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey('BADGE_TOTO');

      // then
      expect(certificationAnswers).to.be.empty;
      expect(certificationChallenges).to.be.empty;
    });
  });

  describe('#isCompleted', function () {
    it('returns true when completed', function () {
      // given
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        state: CertificationAssessment.states.COMPLETED,
      });
      // when / then
      expect(certificationAssessment.isCompleted()).to.be.true;
    });

    it('returns false when only started', function () {
      // given
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        state: CertificationAssessment.states.STARTED,
      });
      // when / then
      expect(certificationAssessment.isCompleted()).to.be.false;
    });
  });

  describe('#getChallengeRecIdByQuestionNumber', function () {
    it('returns the recId when question number exists', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec1234' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec456' });
      const certificationChallenge3 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec789' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1, certificationChallenge2, certificationChallenge3],
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({
            challengeId: certificationChallenge1.challengeId,
            result: AnswerStatus.KO.status,
          }),
          domainBuilder.buildAnswer({
            challengeId: certificationChallenge2.challengeId,
            result: AnswerStatus.KO.status,
          }),
          domainBuilder.buildAnswer({
            challengeId: certificationChallenge3.challengeId,
            result: AnswerStatus.KO.status,
          }),
        ],
      });

      // when
      const recId = certificationAssessment.getChallengeRecIdByQuestionNumber(2);

      // then
      expect(recId).to.equal('rec456');
    });

    it('returns null when question number does not exist', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'rec1234' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1],
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({
            challengeId: certificationChallenge1.challengeId,
            result: AnswerStatus.KO.status,
          }),
        ],
      });

      // when
      const recId = certificationAssessment.getChallengeRecIdByQuestionNumber(2);

      // then
      expect(recId).to.equal(null);
    });
  });

  describe('#skipUnansweredChallenges', function () {
    it('should skip unanswered challenges', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec1234',
        hasBeenSkippedAutomatically: false,
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec456',
        hasBeenSkippedAutomatically: false,
      });
      const certificationChallenge3 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec789',
        hasBeenSkippedAutomatically: false,
      });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1, certificationChallenge2, certificationChallenge3],
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({
            challengeId: certificationChallenge1.challengeId,
            result: AnswerStatus.KO.status,
          }),
          domainBuilder.buildAnswer({
            challengeId: certificationChallenge3.challengeId,
            result: AnswerStatus.KO.status,
          }),
        ],
      });

      // when
      certificationAssessment.skipUnansweredChallenges();

      // then
      expect(
        certificationAssessment.certificationChallenges.find(
          (certificationChallenge) => certificationChallenge.challengeId === 'rec456'
        ).hasBeenSkippedAutomatically
      ).to.be.true;
      expect(
        certificationAssessment.certificationChallenges.find(
          (certificationChallenge) => certificationChallenge.challengeId === 'rec1234'
        ).hasBeenSkippedAutomatically
      ).to.be.false;
      expect(
        certificationAssessment.certificationChallenges.find(
          (certificationChallenge) => certificationChallenge.challengeId === 'rec789'
        ).hasBeenSkippedAutomatically
      ).to.be.false;
    });
  });

  describe('#neutralizeUnansweredChallenges', function () {
    it('should neutralize unanswered challenges', function () {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec1234',
        isNeutralized: false,
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec456',
        isNeutralized: false,
      });
      const certificationChallenge3 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec789',
        isNeutralized: false,
      });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1, certificationChallenge2, certificationChallenge3],
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({
            challengeId: certificationChallenge1.challengeId,
            result: AnswerStatus.KO.status,
          }),
          domainBuilder.buildAnswer({
            challengeId: certificationChallenge3.challengeId,
            result: AnswerStatus.KO.status,
          }),
        ],
      });

      // when
      certificationAssessment.neutralizeUnansweredChallenges();

      // then
      expect(
        certificationAssessment.certificationChallenges.find(
          (certificationChallenge) => certificationChallenge.challengeId === 'rec456'
        ).isNeutralized
      ).to.be.true;
      expect(
        certificationAssessment.certificationChallenges.find(
          (certificationChallenge) => certificationChallenge.challengeId === 'rec1234'
        ).isNeutralized
      ).to.be.false;
      expect(
        certificationAssessment.certificationChallenges.find(
          (certificationChallenge) => certificationChallenge.challengeId === 'rec789'
        ).isNeutralized
      ).to.be.false;
    });
  });
});
