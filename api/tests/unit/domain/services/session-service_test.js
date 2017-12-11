const { describe, context, it, expect, sinon, afterEach } = require('../../../test-helper');
const session = require('../../../../lib/domain/services/session-service');

describe('Unit | Service | session', () => {
  describe('#getCurrentCode', () => {

    let clock;
    afterEach(() => clock.restore());

    it('should return a string of 6 characters', () => {
      // given
      clock = sinon.useFakeTimers();

      // when
      const result = session.getCurrentCode();

      // then
      expect(result).to.have.lengthOf(6);
    });

    context('when called multiple times in the same time span', () => {
      it('should return a code depending on the date', () => {
        // given
        clock = sinon.useFakeTimers(new Date('Mon, 04 Feb 1991 15:00:00 GMT'));
        const expectedCode = '0b3782';

        // when
        const code = session.getCurrentCode();

        // then
        expect(code).to.equal(expectedCode);
      });

      it('should return the same code for the same hour of the same date', () => {
        // given
        clock = sinon.useFakeTimers(new Date('Mon, 04 Feb 1991 15:46:00 GMT'));
        const expectedCode = '0b3782';

        // when
        const code = session.getCurrentCode();

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
        const code = session.getCurrentCode();

        // then
        expect(code).to.equal(expectedCode);
      });
    });

  });
});
