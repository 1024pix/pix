import { CertificationAnswer } from '../../../../../../src/certification/shared/domain/models/CertificationAnswer.js';
import { AnswerStatus } from '../../../../../../src/shared/domain/models/AnswerStatus.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Shared | Domain | Models | CertificationAnswer', function () {
  describe('#constructor', function () {
    it('initializes the certification answer with its properties', function () {
      // when
      const certificationAnswer = new CertificationAnswer({
        id: 123,
        challengeId: 'recChallenge',
        result: AnswerStatus.OK,
        value: 'user answer',
      });

      // then
      expect(certificationAnswer.id).to.equal(123);
      expect(certificationAnswer.challengeId).to.equal('recChallenge');
      expect(certificationAnswer.result).to.deep.equal(AnswerStatus.OK);
      expect(certificationAnswer.value).to.equal('user answer');
    });

    it('builds the result as an AnswerStatus when given its database string representation', function () {
      // when
      const certificationAnswer = new CertificationAnswer({ result: 'aband' });

      // then
      expect(certificationAnswer.result).to.deep.equal(AnswerStatus.SKIPPED);
    });

    it('keeps the result as-is when given an AnswerStatus', function () {
      // when
      const certificationAnswer = new CertificationAnswer({ result: AnswerStatus.FOCUSEDOUT });

      // then
      expect(certificationAnswer.result).to.deep.equal(AnswerStatus.FOCUSEDOUT);
    });
  });

  describe('#isOk', function () {
    it('returns true when the result is OK', function () {
      // given
      const certificationAnswer = new CertificationAnswer({ result: AnswerStatus.OK });

      // when / then
      expect(certificationAnswer.isOk()).to.be.true;
    });

    it('returns false when the result is not OK', function () {
      // given
      const certificationAnswer = new CertificationAnswer({ result: AnswerStatus.KO });

      // when / then
      expect(certificationAnswer.isOk()).to.be.false;
    });
  });
});
