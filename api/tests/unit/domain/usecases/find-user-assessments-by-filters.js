const { expect, sinon, factory } = require('../../../test-helper');

const findUserAssessmentsByFilters = require('../../../../lib/domain/usecases/find-user-assessments-by-filters');

describe('Unit | UseCase | find-user-assessments-by-filters', () => {

  const assessmentRepository = {
    findByFilters: () => {
    },
    getByCertificationCourseId: () => {
    }
  };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(assessmentRepository, 'findByFilters').resolves([]);
    sandbox.stub(assessmentRepository, 'getByCertificationCourseId').resolves([]);
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
    it('should call repository to find the certification assessment', () => {
      // given
      const userId = 1234;
      const filters = { type: 'CERTIFICATION', courseId: '2' };

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then(() => {
        expect(assessmentRepository.getByCertificationCourseId).to.have.been.calledWithExactly(filters.courseId);
      });
    });

    it('should filter assessmentBy userId', () => {
      // given
      const userId = 1234;
      const filters = { type: 'CERTIFICATION', courseId: '2' };
      assessmentRepository.getByCertificationCourseId.resolves(factory.buildAssessment({ userId: 3456, courseId: filters.courseId }));

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal([]);
      });
    });

  });

  context('when filters not contains a codeCampaign or an certification', () => {
    it('should resolve an empty array', () => {
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
