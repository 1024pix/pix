const { expect, knex, sinon } = require('../../../test-helper');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const BookshelfAssessment = require('../../../../lib/infrastructure/data/assessment');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Repository | assessmentRepository', () => {

  describe('#findLastAssessmentsForEachCoursesByUser', () => {
    const JOHN = 2;
    const LAYLA = 3;
    const assessmentsInDb = [{
      id: 1,
      userId: JOHN,
      courseId: 'courseId1',
      state: 'completed',
      type: 'PLACEMENT',
    }, {
      id: 2,
      userId: LAYLA,
      courseId: 'courseId1',
      state: 'completed',
      type: 'PLACEMENT',
    }, {
      id: 3,
      userId: JOHN,
      courseId: 'courseId1',
      state: 'completed',
      type: 'PLACEMENT',
    }, {
      id: 4,
      userId: JOHN,
      courseId: 'courseId2',
      state: 'completed',
      type: 'PLACEMENT',
    }, {
      id: 5,
      userId: JOHN,
      courseId: 'courseId3',
      state: 'completed',
      type: Assessment.types.CERTIFICATION,
    }, {
      id: 6,
      userId: LAYLA,
      courseId: 'nullAssessmentPreview',
      state: 'completed',
      type: 'DEMO',
    }];

    before(() => {
      return knex('assessments').insert(assessmentsInDb);
    });

    after(() => {
      return knex('assessments').delete();
    });

    it('should return the list of assessments (which are not Certifications) for each courses from JOHN', () => {
      // when
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(JOHN);

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(2);

        const firstId = assessments[0].id;
        expect(firstId).to.equal(1);

        const secondId = assessments[1].id;
        expect(secondId).to.equal(4);
      });
    });

    it('should not return preview assessments', () => {
      // when
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(LAYLA);

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(1);
      });
    });

    it('should throw an error if something went wrong', () => {
      //Given
      const error = new Error('Unable to fetch');
      const whereStub = sinon.stub(BookshelfAssessment, 'where').returns({
        fetchAll: () => {
          return Promise.reject(error);
        },
      });

      // when
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(JOHN);

      // then
      whereStub.restore();
      return promise
        .catch((err) => {
          expect(err).to.equal(error);
        });
    });
  });

  describe('#findLastCompletedAssessmentsForEachCoursesByUser', () => {
    const assessmentsInDb = [{
      id: 1,
      userId: 2,
      courseId: 'courseId1',
      state: 'completed',
    }, {
      id: 2,
      userId: 3,
      courseId: 'courseId1',
      state: 'completed',
    }];

    before(() => {
      return knex('assessments').insert(assessmentsInDb);
    });

    after(() => {
      return knex('assessments').delete();
    });

    let sandbox;
    let queryStub;
    let fetchStub;
    let whereStub;
    let whereCreatedAtStub;
    let whereStatusIsCompleted;
    let orderByStub;
    let andWhere;
    const userId = 2;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      orderByStub = sandbox.stub();
      andWhere = sandbox.stub().returns({
        orderBy: orderByStub,
      });
      whereStatusIsCompleted = sandbox.stub().returns({
        andWhere: andWhere,
      });

      whereCreatedAtStub = sandbox.stub().returns({
        where: whereStatusIsCompleted,
      });

      whereStub = sandbox.stub().returns({
        where: whereCreatedAtStub,
      });

      fetchStub = sandbox.stub().resolves({ models: {} });
      queryStub = sandbox.stub().yields({ where: whereStub }).returns({
        fetch: fetchStub,
      });
      sandbox.stub(BookshelfAssessment, 'collection').returns({
        query: queryStub,
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    // FIXME: Should be in the repository
    it('should correctly query Assessment conditions', () => {
      // when
      const limitDate = '2018-02-02T19:20:21.0';
      const promise = assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(userId, limitDate);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(BookshelfAssessment.collection);
        sinon.assert.calledOnce(queryStub);
        sinon.assert.calledOnce(whereStub);
        sinon.assert.calledOnce(fetchStub);

        sinon.assert.calledOnce(whereCreatedAtStub);
        sinon.assert.calledWith(whereCreatedAtStub, 'createdAt', '<', limitDate);

        sinon.assert.calledOnce(whereStatusIsCompleted);
        sinon.assert.calledWith(whereStatusIsCompleted, 'state', '=', 'completed');

        sinon.assert.calledOnce(orderByStub);
        sinon.assert.calledWith(orderByStub, 'createdAt', 'desc');
      });
    });
  });

  describe('#findCompletedAssessmentsByUserId', () => {

    const JOHN = 2;
    const LAYLA = 3;
    const COMPLETED_ASSESSMENT_A_ID = 1;
    const COMPLETED_ASSESSMENT_B_ID = 2;
    const UNCOMPLETE_ASSESSMENT_ID = 3;

    const assessmentsInDb = [{
      id: COMPLETED_ASSESSMENT_A_ID,
      userId: JOHN,
      courseId: 'courseId',
      state: 'completed',
      type: 'PLACEMENT',
    }, {
      id: COMPLETED_ASSESSMENT_B_ID,
      userId: JOHN,
      courseId: 'courseId',
      state: 'completed',
      type: 'PLACEMENT',
    }, {
      id: UNCOMPLETE_ASSESSMENT_ID,
      userId: JOHN,
      courseId: 'courseId',
      state: 'started',
      type: 'PLACEMENT',
    }, {
      id: 4,
      userId: LAYLA,
      courseId: 'courseId',
      state: 'completed',
      type: 'PLACEMENT',
    }, {
      id: 5,
      userId: JOHN,
      courseId: 'courseId',
      state: 'completed',
      type: Assessment.types.CERTIFICATION,
    }, {
      id: 6,
      userId: LAYLA,
      courseId: 'nullAssessmentPreview',
      state: 'completed',
      type: 'DEMO',
    }];

    before(() => {
      return knex('assessments').insert(assessmentsInDb);
    });

    after(() => {
      return knex('assessments').delete();
    });

    it('should return the list of assessments (which are not Certifications) from JOHN', () => {
      // when
      const promise = assessmentRepository.findCompletedAssessmentsByUserId(JOHN);

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(2);

        expect(assessments[0]).to.be.an.instanceOf(Assessment);
        expect(assessments[1]).to.be.an.instanceOf(Assessment);

        expect(assessments[0].id).to.equal(COMPLETED_ASSESSMENT_A_ID);
        expect(assessments[1].id).to.equal(COMPLETED_ASSESSMENT_B_ID);
      });
    });

    it('should not return preview assessments from LAYLA', () => {
      // when
      const promise = assessmentRepository.findCompletedAssessmentsByUserId(LAYLA);

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(1);
      });
    });

    it('should throw an error if something went wrong', () => {
      //Given
      const error = new Error('Unable to fetch');
      const whereStub = sinon.stub(BookshelfAssessment, 'where').returns({
        fetchAll: () => {
          return Promise.reject(error);
        },
      });

      // when
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(JOHN);

      // then
      whereStub.restore();
      return promise
        .catch((err) => {
          expect(err).to.equal(error);
        });

    });

  });

  describe('#getByUserIdAndAssessmentId', () => {

    it('should be a function', () => {
      expect(assessmentRepository.getByUserIdAndAssessmentId).to.be.a('function');
    });

    describe('test collaboration', () => {
      let fetchStub;
      beforeEach(() => {
        fetchStub = sinon.stub().resolves(new BookshelfAssessment());
        sinon.stub(BookshelfAssessment, 'query').returns({
          fetch: fetchStub,
        });
      });

      after(() => {
        BookshelfAssessment.query.restore();
      });

      it('should correctly query Assessment', () => {
        // given
        const fakeUserId = 3;
        const fakeAssessmentId = 2;
        const expectedParams = {
          where: { id: fakeAssessmentId },
          andWhere: { userId: fakeUserId },
        };

        // when
        const promise = assessmentRepository.getByUserIdAndAssessmentId(fakeAssessmentId, fakeUserId);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(BookshelfAssessment.query);
          sinon.assert.calledWith(BookshelfAssessment.query, expectedParams);
          sinon.assert.calledWith(fetchStub, { require: true });
        });
      });
    });

  });

  describe('#save', function() {

    let assessment;

    afterEach(() => {
      BookshelfAssessment.prototype.save.restore();
    });

    context('when assessment is valid', () => {
      beforeEach(() => {
        assessment = Assessment.fromAttributes({ id: '1', type: Assessment.types.CERTIFICATION, userId: 2 });
        const assessmentBookshelf = new BookshelfAssessment(assessment);
        sinon.stub(BookshelfAssessment.prototype, 'save').resolves(assessmentBookshelf);
      });

      it('should save a new assessment', function() {
        // when
        const promise = assessmentRepository.save(assessment);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(BookshelfAssessment.prototype.save);
        });
      });

      it('should return the Assessment', function() {
        // when
        const promise = assessmentRepository.save(assessment);

        // then
        return promise.then((savedAssessment) => {
          expect(savedAssessment).to.be.an.instanceOf(Assessment);
          expect(savedAssessment).to.deep.equal(assessment);
        });
      });
    });

    context('when assessment is not valid', () => {
      beforeEach(() => {
        assessment = Assessment.fromAttributes({ id: '1', type: Assessment.types.CERTIFICATION, userId: undefined });
        const assessmentBookshelf = new BookshelfAssessment(assessment);
        sinon.stub(BookshelfAssessment.prototype, 'save').resolves(assessmentBookshelf);
      });

      it('should not save a new assessment', function() {
        // when
        const promise = assessmentRepository.save(assessment);

        // then
        return promise.catch(() => {
          sinon.assert.notCalled(BookshelfAssessment.prototype.save);
        });
      });

      it('should reject', function() {
        // when
        const promise = assessmentRepository.save(assessment);

        // then
        return expect(promise).to.be.rejected;
      });

    });

  });

  describe('#getByCertificationCourseId', () => {

    let fetchStub;

    beforeEach(() => {
      fetchStub = sinon.stub().resolves(new BookshelfAssessment());
      sinon.stub(BookshelfAssessment, 'where').returns({
        fetch: fetchStub,
      });
    });

    after(() => {
      BookshelfAssessment.where.restore();
    });

    it('should correctly query Assessment', () => {
      // given
      const fakeCertificationCourseId = 10;
      const expectedParams = { courseId: fakeCertificationCourseId };

      // when
      const promise = assessmentRepository.getByCertificationCourseId(fakeCertificationCourseId);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(BookshelfAssessment.where);
        sinon.assert.calledWith(BookshelfAssessment.where, expectedParams);
      });
    });
  });

  describe('#findByFilters', function() {

    const assessmentsInDb = [{
      id: 1,
      userId: 2,
      courseId: 'courseId1',
      state: 'completed',
    }, {
      id: 2,
      userId: 3,
      courseId: 'courseId1',
      state: 'completed',
    }, {
      id: 3,
      userId: 3,
      courseId: 'courseId2',
      state: 'completed',
    }];

    before(() => {
      return knex('assessments').insert(assessmentsInDb);
    });

    after(() => {
      return knex('assessments').delete();
    });

    it('should return courses which have the given courseId', function() {
      // given
      const filters = { courseId: 'courseId1' };

      // when
      const promise = assessmentRepository.findByFilters(filters);

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(2);
        expect(assessments[0].courseId).to.equal('courseId1');
        expect(assessments[1].courseId).to.equal('courseId1');
      });
    });

    it('should return an empty array there is no Assessment found', function() {
      // given
      const filters = { courseId: 'InexistantCourseId' };

      // when
      const promise = assessmentRepository.findByFilters(filters);

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(0);
      });

    });

  });
});
