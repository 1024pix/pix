const SessionForPublication = require('../../../../lib/domain/models/SessionForPublication');
const { expect, domainBuilder } = require('../../../test-helper');

describe.only('Unit | Domain | Models | SessionForPublication', () => {
  context('#isPublishable', () => {
    it('should return false if there is a global comment', () => {
      // when
      const session = new SessionForPublication([], 'globalComment');

      // then
      expect(session.isPublishable()).to.be.false;
    });

    it('should return false if there are at least one certification course with status "started"', () => {
      // when
      const session = new SessionForPublication([
        domainBuilder.buildCertificationCourse({ status: })
      ], 'globalComment');

      // then
      expect(session.isPublishable()).to.be.false;
    });
  });
});
