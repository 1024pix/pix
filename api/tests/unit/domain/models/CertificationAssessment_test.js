const _ = require('lodash');
const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');
const { expect, domainBuilder } = require('../../../test-helper');
const { ObjectValidationError, ChallengeToBeNeutralizedNotFoundError, ChallengeToBeDeneutralizedNotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | CertificationAssessment', () => {

  describe('constructor', () => {
    let validArguments;
    beforeEach(() => {
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

    it('should successfully instantiate object when passing all valid arguments', () => {
      // when
      expect(() => new CertificationAssessment(validArguments))
        .not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when id is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, id: 'coucou' }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when userId is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, userId: 'les zouzous' }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when certificationCourseId is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, certificationCourseId: 'ça gaze ?' }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when createdAt is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, createdAt: 'coucou' }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when completed is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, completedAt: 'ça pétille !' }))
        .to.throw(ObjectValidationError);
    });

    _.forIn(CertificationAssessment.states, (value) => {
      it(`should not throw an ObjectValidationError when state is ${value}`, () => {
        // when
        expect(() => new CertificationAssessment({ ...validArguments, state: value }))
          .not.to.throw(ObjectValidationError);
      });
    });

    it('should throw an ObjectValidationError when status is of unknown value', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, state: 'aaa' }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when isV2Certification is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, isV2Certification: 'glouglou' }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when certificationChallenges is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, certificationChallenges: [] }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when certificationAnswersByDate is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, certificationAnswersByDate: 'glouglou' }))
        .to.throw(ObjectValidationError);
    });

    it('should be valid when certificationAnswersByDate has no answer', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, certificationAnswersByDate: [] }))
        .not.to.throw(ObjectValidationError);
    });
  });

  describe('#getCertificationChallenge', () => {

    it('returns the challenge for the given challengeId', () => {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallenge({ challengeId: 'rec1234' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallenge({ challengeId: 'rec456' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1, certificationChallenge2],
      });

      // when
      const certificationChallenge = certificationAssessment.getCertificationChallenge('rec1234');

      // then
      expect(certificationChallenge).to.deep.equal(certificationChallenge1);
    });

    it('returns null if no certification challenge exists for challengeId', () => {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallenge({ challengeId: 'rec1234' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallenge({ challengeId: 'rec456' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1, certificationChallenge2],
      });

      // when
      const certificationChallenge = certificationAssessment.getCertificationChallenge('wrongId');

      // then
      expect(certificationChallenge).to.be.null;

    });
  });

  describe('#neutralizeChallengeByRecId', () => {

    it('neutralizes the challenge when the challenge was asked', () => {
      // given
      const challengeToBeNeutralized = domainBuilder.buildCertificationChallenge({ challengeId: 'rec1', isNeutralized: false });

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
          domainBuilder.buildCertificationChallenge({ challengeId: 'rec2', isNeutralized: false }),
          domainBuilder.buildCertificationChallenge({ challengeId: 'rec3', isNeutralized: false }),
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

    it('throws when the challenge was not asked', async () => {
      // given
      const challengeNotAskedToBeNeutralized = domainBuilder.buildCertificationChallenge({ challengeId: 'rec1', isNeutralized: false });

      const certificationAssessment = new CertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: [
          domainBuilder.buildCertificationChallenge({ challengeId: 'rec2', isNeutralized: false }),
          domainBuilder.buildCertificationChallenge({ challengeId: 'rec3', isNeutralized: false }),
        ],
        certificationAnswersByDate: ['answer'],
      });

      // when / then
      expect(() => { certificationAssessment.neutralizeChallengeByRecId(challengeNotAskedToBeNeutralized.challengeId); })
        .to.throw(ChallengeToBeNeutralizedNotFoundError);
    });
  });

  describe('#deneutralizeChallengeByRecId', () => {

    it('deneutralizes the challenge when the challenge was asked', () => {
      // given
      const challengeToBeDeneutralized = domainBuilder.buildCertificationChallenge({ challengeId: 'rec1', isNeutralized: true });

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
          domainBuilder.buildCertificationChallenge({ challengeId: 'rec2', isNeutralized: true }),
          domainBuilder.buildCertificationChallenge({ challengeId: 'rec3', isNeutralized: true }),
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

    it('throws when the challenge was not asked', async () => {
      // given
      const challengeNotAskedToBeDeneutralized = domainBuilder.buildCertificationChallenge({ challengeId: 'rec1', isNeutralized: false });

      const certificationAssessment = new CertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: [
          domainBuilder.buildCertificationChallenge({ challengeId: 'rec2', isNeutralized: false }),
          domainBuilder.buildCertificationChallenge({ challengeId: 'rec3', isNeutralized: false }),
        ],
        certificationAnswersByDate: ['answer'],
      });

      // when / then
      expect(() => { certificationAssessment.deneutralizeChallengeByRecId(challengeNotAskedToBeDeneutralized.challengeId); })
        .to.throw(ChallengeToBeDeneutralizedNotFoundError);
    });
  });

  describe('#listCertifiableBadgeKeysTaken', () => {

    it('returns the certifiable badge keys of those taken during this certification', () => {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallenge({ challengeId: 'chal1', certifiableBadgeKey: 'BADGE_2' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallenge({ challengeId: 'chal2', certifiableBadgeKey: 'BADGE_1' });
      const certificationChallenge3 = domainBuilder.buildCertificationChallenge({ challengeId: 'chal3', certifiableBadgeKey: 'BADGE_2' });
      const certificationChallenge4 = domainBuilder.buildCertificationChallenge({ challengeId: 'chal4', certifiableBadgeKey: null });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1, certificationChallenge2, certificationChallenge3, certificationChallenge4],
      });

      // when
      const certifiableBadgeKeys = certificationAssessment.listCertifiableBadgeKeysTaken();

      // then
      expect(certifiableBadgeKeys).to.deep.include.members([
        'BADGE_2',
        'BADGE_1',
      ]);
      expect(certifiableBadgeKeys).to.have.lengthOf(2);
    });

    it('returns an empty array if no certifiable badge exam was taken', () => {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallenge({ challengeId: 'chal1', certifiableBadgeKey: null });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1],
      });

      // when
      const certifiableBadgeKeys = certificationAssessment.listCertifiableBadgeKeysTaken();

      // then
      expect(certifiableBadgeKeys).to.be.empty;
    });
  });

  describe('#findAnswersForCertifiableBadgeKey', () => {

    it('returns the answers for a certifiableBadgeKey', () => {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallenge({ challengeId: 'chal1', certifiableBadgeKey: 'BADGE_1' });
      const certificationChallenge2 = domainBuilder.buildCertificationChallenge({ challengeId: 'chal2', certifiableBadgeKey: 'BADGE_2' });
      const certificationChallenge3 = domainBuilder.buildCertificationChallenge({ challengeId: 'chal3', certifiableBadgeKey: 'BADGE_1' });
      const certificationChallenge4 = domainBuilder.buildCertificationChallenge({ challengeId: 'chal4', certifiableBadgeKey: null });
      const certificationAnswer1 = domainBuilder.buildAnswer({ challengeId: 'chal1' });
      const certificationAnswer2 = domainBuilder.buildAnswer({ challengeId: 'chal2' });
      const certificationAnswer3 = domainBuilder.buildAnswer({ challengeId: 'chal3' });
      const certificationAnswer4 = domainBuilder.buildAnswer({ challengeId: 'chal4' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1, certificationChallenge2, certificationChallenge3, certificationChallenge4],
        certificationAnswersByDate: [certificationAnswer1, certificationAnswer2, certificationAnswer3, certificationAnswer4],
      });

      // when
      const answersByCertifiableBadgeKey = certificationAssessment.findAnswersForCertifiableBadgeKey('BADGE_1');

      // then
      expect(answersByCertifiableBadgeKey).to.deep.equals([certificationAnswer1, certificationAnswer3]);
    });

    it('returns an empty array if there are no answers for given key', () => {
      // given
      const certificationChallenge1 = domainBuilder.buildCertificationChallenge({ challengeId: 'chal1', certifiableBadgeKey: 'BADGE_1' });
      const certificationAnswer1 = domainBuilder.buildAnswer({ challengeId: 'chal1' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationChallenges: [certificationChallenge1],
        certificationAnswersByDate: [certificationAnswer1],
      });

      // when
      const answersByCertifiableBadgeKey = certificationAssessment.findAnswersForCertifiableBadgeKey('BADGE_TOTO');

      // then
      expect(answersByCertifiableBadgeKey).to.be.empty;
    });
  });
});
