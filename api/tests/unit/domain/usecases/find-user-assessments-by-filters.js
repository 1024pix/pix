const { expect, sinon } = require('../../../test-helper');

const findUserAssessmentsByFilters = require('../../../../lib/domain/usecases/find-user-assessments-by-filters');

describe('Unit | UseCase | find-user-assessments-by-filters', () => {

  const assessmentRepository = {
    findByFilters: () => {
    }
  };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(assessmentRepository, 'findByFilters').resolves([]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('when filters contains a codeCampaign', () => {
    it('should resolve assessments that match filters and belong to the user', () => {
      // given
      const userId = 1234;
      const filters = { type: 'SMART_PLACEMENT', codeCampaign: 'Code' };
      const expectedFilters = { type: 'SMART_PLACEMENT', userId };

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then(() => {
        expect(assessmentRepository.findByFilters).to.have.been.calledWithExactly(expectedFilters);
      });
    });
  });

  context('when filters contains a type certification', () => {
    it('should call repository with filter to find the certification assessment', () => {
      // given
      const userId = 1234;
      const filters = { type: 'CERTIFICATION', courseId: '2' };
      const expectedFilters = { type: 'CERTIFICATION', courseId: '2', userId };

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then(() => {
        expect(assessmentRepository.findByFilters).to.have.been.calledWithExactly(expectedFilters);
      });
    });
  });

  context('when filters not contains a codeCampaign or an certification', () => {
    it('should resolve an empty arrat', () => {
      // given
      const userId = 1234;
      const filters = { type: 'DEMO' };

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal([]);
      });
    });
  });
});
