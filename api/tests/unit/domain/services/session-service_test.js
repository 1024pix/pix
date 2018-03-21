const { expect, sinon } = require('../../../test-helper');
const sessionService = require('../../../../lib/domain/services/session-service');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Service | session', () => {
  describe('#getCurrentCode', () => {

    let clock;
    afterEach(() => clock.restore());

    it('should return a string of 6 characters', () => {
      // given
      clock = sinon.useFakeTimers();

      // when
      const result = sessionService.getCurrentCode();

      // then
      expect(result).to.have.lengthOf(6);
    });

    context('when called multiple times in the same time span', () => {
      it('should return a code depending on the date', () => {
        // given
        clock = sinon.useFakeTimers(new Date('Mon, 04 Feb 1991 15:00:00 GMT'));
        const expectedCode = '0b3782';

        // when
        const code = sessionService.getCurrentCode();

        // then
        expect(code).to.equal(expectedCode);
      });

      it('should return the same code for the same hour of the same date', () => {
        // given
        clock = sinon.useFakeTimers(new Date('Mon, 04 Feb 1991 15:46:00 GMT'));
        const expectedCode = '0b3782';

        // when
        const code = sessionService.getCurrentCode();

        // then
        expect(code).to.equal(expectedCode);
      });
    });

    context('when called in a different time span', () => {
      it('should return a different code', () => {
        // given
        clock = sinon.useFakeTimers(new Date('Mon, 04 Feb 1991 16:01:00 GMT'));
        const expectedCode = '2ab562';

        // when
        const code = sessionService.getCurrentCode();

        // then
        expect(code).to.equal(expectedCode);
      });
    });
  });

  describe('#sessionExists', () => {

    beforeEach(() => {
      sinon.stub(sessionCodeService, 'getSessionByAccessCode');
    });

    afterEach(() => {
      sessionCodeService.getSessionByAccessCode.restore();
    });

    context('when access-code is not given', () => {
      it('should stop the request', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves(null);

        // when
        const promise = sessionService.sessionExists(null);

        // then
        return promise.catch((result) => {
          expect(result).to.be.an.instanceOf(NotFoundError);
        });
      });
    });

    context('when access-code is wrong', () => {
      it('should stop the request', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves(null);

        // when
        const promise = sessionService.sessionExists('1234');

        // then
        return promise.catch((result) => {
          expect(result).to.be.an.instanceOf(NotFoundError);
        });
      });
    });

    context('when access-code is correct', () => {
      it('should let the request continue', () => {
        // given
        sessionCodeService.getSessionByAccessCode.resolves({ id: 12 });

        // when
        const promise = sessionService.sessionExists('ABCD12');

        // then
        return promise.then((result) => {
          expect(result).to.be.equal(12);
        });
      });
    });
  });

});
