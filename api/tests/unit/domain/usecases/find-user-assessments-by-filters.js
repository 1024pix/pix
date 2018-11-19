const { expect, sinon } = require('../../../test-helper');

const findUserAssessmentsByFilters = require('../../../../lib/domain/usecases/find-user-assessments-by-filters');

describe('Unit | UseCase | find-user-assessments-by-filters', () => {

  const assessmentRepository = {
    getByFilters: () => {
    },
    findByCampaignFilters: () => {
    },
    getByCertificationCourseId: () => {
    }
  };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(assessmentRepository, 'findByCampaignFilters').resolves([]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('when this is a campaign placement', () => {
    it('should resolve assessments that match filters and belong to the user', () => {
      // given
      const userId = 1234;
      const filters = { type: 'SMART_PLACEMENT', codeCampaign: 'Code' };
      const expectedFilters = { type: 'SMART_PLACEMENT', userId };

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then(() => {
        expect(assessmentRepository.findByCampaignFilters).to.have.been.calledWithExactly(expectedFilters);
      });
    });
  });

  context('when this is a certification or a simple placement', () => {
    it('should call repository to find the assessment', () => {
      // given
      const userId = 1234;
      const filters = { type: 'CERTIFICATION', courseId: '2' };
      sandbox.stub(assessmentRepository, 'getByFilters').resolves({});

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then(() => {
        expect(assessmentRepository.getByFilters).to.have.been.calledWithExactly({ ...filters, userId });
      });
    });

    it('should resolve an empty array', () => {
      // given
      const userId = 1234;
      const filters = { type: 'PLACEMENT', courseId: '2' };
      sandbox.stub(assessmentRepository, 'getByFilters').resolves(null);

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal([]);
      });
    });

    it('should resolve an assessment', () => {
      // given
      const userId = 1234;
      const filters = { type: 'PLACEMENT', courseId: '2' };
      const assessment = {
        ...filters,
        userId,
        id: '1',
        state: 'started'
      };
      sandbox.stub(assessmentRepository, 'getByFilters').resolves(assessment);

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal([assessment]);
      });
    });
  });

  context('when this is not a campaign or certification or simple placement', () => {
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
