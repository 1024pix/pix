const { expect, factory, sinon } = require('../../../test-helper');
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
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('when this is a campaign placement', () => {
    it('should call repository with filters to find assessments', () => {
      // given
      const userId = 1234;
      const filters = { type: 'SMART_PLACEMENT', codeCampaign: 'Code' };
      const expectedFilters = { type: 'SMART_PLACEMENT', userId };
      sandbox.stub(assessmentRepository, 'findByCampaignFilters').resolves([]);

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then(() => {
        expect(assessmentRepository.findByCampaignFilters).to.have.been.calledWithExactly(expectedFilters);
      });
    });

    it('should resolve assessments that match filters and belong to the user but has no campaign participation', () => {
      // given
      const userId = 1234;
      const filters = { type: 'SMART_PLACEMENT', codeCampaign: 'Code' };
      const assessment = factory.buildAssessment({
        ...filters,
        userId,
      });
      sandbox.stub(assessmentRepository, 'findByCampaignFilters').resolves([assessment]);

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal([]);
      });
    });

    it('should resolve assessments that match filters and belong to the user and has campaign participation', () => {
      // given
      const userId = 1234;
      const campaignCode = 'Code';
      const filters = { type: 'SMART_PLACEMENT', codeCampaign: campaignCode };
      const campaign = factory.buildCampaign({ code: campaignCode });
      const campaignParticipation = factory.buildCampaignParticipation({ campaign });
      const assessment = factory.buildAssessment({
        ...filters,
        userId,
        campaignParticipation
      });
      sandbox.stub(assessmentRepository, 'findByCampaignFilters').resolves([assessment]);

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal([assessment]);
      });
    });
  });

  context('when this is a certification or a simple placement', () => {
    it('should call repository with filters to find the assessment', () => {
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

    it('should resolve an assessment of type PLACEMENT', () => {
      // given
      const userId = 1234;
      const course = factory.buildCertificationCourse();
      const filters = { type: 'PLACEMENT', courseId: course.id };
      const  assessment = factory.buildAssessment({
        ...filters,
        userId,
        state: 'started',
      });
      sandbox.stub(assessmentRepository, 'getByFilters').resolves(assessment);

      // when
      const promise = findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal([assessment]);
      });
    });

    it('should resolve an assessment of type CERTIFICATION', () => {
      // given
      const userId = 1234;
      const course = factory.buildCertificationCourse();
      const filters = { type: 'CERTIFICATION', courseId: course.id };
      const  assessment = factory.buildAssessment({
        ...filters,
        userId,
      });
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
