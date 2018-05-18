const { expect, sinon } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/cache');
const airtable = require('../../../../lib/infrastructure/airtable');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const courseSerializer = require('../../../../lib/infrastructure/serializers/airtable/course-serializer');
const Course = require('../../../../lib/domain/models/Course');

function _buildCourse(id, name, description) {
  return {
    id,
    name,
    description,

    assessment: undefined,
    challenges: [],
    competences: undefined,
    imageUrl: undefined,
    isAdaptive: undefined,
    type: undefined,
  };
}

describe('Unit | Repository | course-repository', function() {

  let getRecord;
  let getRecords;

  beforeEach(function() {
    cache.flushAll();
    getRecord = sinon.stub(airtable, 'getRecord');
    getRecords = sinon.stub(airtable, 'getRecords');
  });

  afterEach(function() {
    cache.flushAll();
    getRecord.restore();
    getRecords.restore();
  });

  /*
   * #get
   */

  describe('#get', function() {

    const courseId = 'courseId';
    const cacheKey = `course-repository_get_${courseId}`;
    const course = { foo: 'bar' };

    it('should resolve with the course directly retrieved from the cache without calling airtable when the course has been cached', () => {
      // given
      getRecord.resolves(true);
      cache.set(cacheKey, course);

      // when
      const result = courseRepository.get(courseId);

      // then
      expect(getRecord.notCalled).to.be.true;
      return expect(result).to.eventually.deep.equal(course);
    });

    it('should reject with an error when the cache throw an error', () => {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get').callsFake((key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = courseRepository.get(courseId);

      // then
      cache.get.restore();
      return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
    });

    describe('when the course was not previously cached', function() {

      beforeEach(function() {
        getRecord.resolves(course);
      });

      it('should resolve with the courses fetched from Airtable', () => {
        // when
        const result = courseRepository.get(courseId);

        // then
        return expect(result).to.eventually.deep.equal(course);
      });

      it('should cache the course fetched from Airtable', done => {
        // when
        courseRepository.get(courseId).then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly airtable', done => {
        // when
        courseRepository.get(courseId).then(() => {

          // then
          expect(getRecord.calledWith('Tests', courseId, courseSerializer)).to.be.true;
          done();
        });
      });
    });
  });

  /*
   * #refresh
   */

  describe('#refresh', function() {

    const courseId = 'course_id';
    const cacheKey = `course-repository_get_${courseId}`;

    it('should reject with an error when the cache throw an error', () => {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'del').callsFake((key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = courseRepository.refresh(courseId);

      // then
      cache.del.restore();
      return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
    });

    it('should resolve with the course fetched from airtable when the course was not previously cached', () => {
      // given
      const course = {
        id: courseId,
        name: 'Course name',
        description: 'Course description'
      };
      getRecord.resolves(course);

      // when
      const result = courseRepository.refresh(courseId);

      // then
      return expect(result).to.eventually.deep.equal(course);
    });

    it('should replace the old course by the new one in cache', done => {
      // given
      const oldCourse = {
        id: courseId,
        name: 'Old course',
        description: 'Old description of the course'
      };
      cache.set(cacheKey, oldCourse);
      const newCourse = {
        id: courseId,
        name: 'New course',
        description: 'new description of the course'
      };
      getRecord.resolves(newCourse);

      // when
      courseRepository.refresh(courseId).then(() => {

        // then
        cache.get(cacheKey, (err, cachedValue) => {
          expect(cachedValue).to.deep.equal(newCourse);
          done();
        });
      });
    });
  });

  /*
   * #getProgressionCourses
   */

  describe('#getProgressionCourses', function() {

    const cacheKey = 'course-repository_getProgressionTests';
    const courses = [
      _buildCourse('course_id_1', 'Course #1', 'Desc. #1'),
      _buildCourse('course_id_2', 'Course #2', 'Desc. #2'),
      _buildCourse('course_id_3', 'Course #3', 'Desc. #3')
    ];

    it('should reject with an error when the cache throw an error', function() {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get').callsFake((key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = courseRepository.getProgressionCourses();

      // then
      cache.get.restore();
      return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
    });

    it('should resolve with the course directly retrieved from the cache without calling airtable when the course has been cached', function() {
      // given
      getRecords.resolves(true);
      cache.set(cacheKey, courses);

      // when
      const result = courseRepository.getProgressionCourses();

      // then
      expect(getRecords.notCalled).to.be.true;
      return expect(result).to.eventually.deep.equal(courses);
    });

    describe('when courses have not been previsously cached', function() {

      beforeEach(function() {
        getRecords.resolves(courses);
      });

      it('should resolve an Array of Course Domain Object', function() {
        // when
        const promise = courseRepository.getProgressionCourses();

        // then
        return promise.then((courses) => {
          courses.forEach(course => {
            expect(course).to.be.instanceOf(Course);
          });
        });
      });

      it('should resolve with the courses fetched from Airtable', function() {
        // when
        const result = courseRepository.getProgressionCourses();

        // then
        return expect(result).to.eventually.deep.equal(courses);
      });

      it('should cache the course fetched from Airtable', done => {
        // when
        courseRepository.getProgressionCourses().then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly airtable', () => {
        // given
        const expectedQuery = {
          filterByFormula: '{Statut} = "Publié"',
          view: 'Tests de progression'
        };

        // when
        return courseRepository.getProgressionCourses().then(() => {

          // then
          expect(getRecords.calledWith('Tests', expectedQuery, courseSerializer)).to.be.true;
        });
      });
    });

  });

  /*
   * #getCoursesOfTheWeek
   */

  describe('#getCoursesOfTheWeek', function() {

    const cacheKey = 'course-repository_getCoursesOfTheWeek';
    const courses = [
      _buildCourse('course_id_1', 'Course #1', 'Desc. #1'),
      _buildCourse('course_id_2', 'Course #2', 'Desc. #2'),
      _buildCourse('course_id_3', 'Course #3', 'Desc. #3')
    ];

    it('should reject with an error when the cache throw an error', () => {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get').callsFake((key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = courseRepository.getCoursesOfTheWeek();

      // then
      cache.get.restore();
      return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
    });

    it('should resolve with the courses directly retrieved from the cache without calling airtable when the course has been cached', () => {
      // given
      getRecords.resolves(true);
      cache.set(cacheKey, courses);

      // when
      const result = courseRepository.getCoursesOfTheWeek();

      // then
      expect(getRecords.notCalled).to.be.true;
      return expect(result).to.eventually.deep.equal(courses);
    });

    describe('when courses have not been previsously cached', function() {

      beforeEach(function() {
        getRecords.resolves(courses);
      });

      it('should resolve with the courses fetched from Airtable', () => {
        // when
        const result = courseRepository.getCoursesOfTheWeek();

        // then
        return expect(result).to.eventually.deep.equal(courses);
      });

      it('should cache the course fetched from Airtable', done => {
        // when
        courseRepository.getCoursesOfTheWeek().then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly airtable', () => {
        // given
        const expectedQuery = {
          filterByFormula: '{Statut} = "Publié"',
          view: 'Défis de la semaine'
        };

        // when
        courseRepository.getCoursesOfTheWeek().then(() => {

          // then
          return expect(getRecords.calledWith('Tests', expectedQuery, courseSerializer)).to.be.true;
        });
      });
    });

  });

  /*
   * #getAdaptiveCourses
   */

  describe('#getAdaptiveCourses', function() {

    const cacheKey = 'course-repository_getAdaptiveCourses';
    const courses = [
      _buildCourse('course_id_1', 'Course #1', 'Desc. #1'),
      _buildCourse('course_id_2', 'Course #2', 'Desc. #2'),
      _buildCourse('course_id_3', 'Course #3', 'Desc. #3')
    ];

    it('should reject with an error when the cache throw an error', () => {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get').callsFake((key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = courseRepository.getAdaptiveCourses();

      // then
      cache.get.restore();
      return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
    });

    it('should resolve with the courses directly retrieved from the cache without calling airtable when the course has been cached', () => {
      // given
      getRecords.resolves(true);
      cache.set(cacheKey, courses);

      // when
      const result = courseRepository.getAdaptiveCourses();

      // then
      expect(getRecords.notCalled).to.be.true;
      return expect(result).to.eventually.deep.equal(courses);
    });

    describe('when courses have not been previsously cached', () => {

      beforeEach(function() {
        getRecords.resolves(courses);
      });

      it('should resolve with the courses fetched from Airtable', () => {
        // when
        const result = courseRepository.getAdaptiveCourses();

        // then
        return expect(result).to.eventually.deep.equal(courses);
      });

      it('should cache the course fetched from Airtable', done => {
        // when
        courseRepository.getAdaptiveCourses().then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly airtable', () => {
        // given
        const expectedQuery = {
          filterByFormula: '{Statut} = "Publié"',
          view: 'Tests de positionnement'
        };

        // when
        return courseRepository.getAdaptiveCourses().then(() => {
          // then
          expect(getRecords.calledWith('Tests', expectedQuery, courseSerializer)).to.be.true;
        });
      });
    });
  });

  /*
   * #refreshAll
   */

  describe('#refreshAll', function() {

    it('should resolve with true when the clean succeeds', done => {
      // given
      sinon.stub(cache, 'del').callsFake((key, callback) => {
        callback();
      });

      // when
      courseRepository.refreshAll().then(() => {

        // then
        expect(cache.del.calledThrice).to.be.true;

        // after
        cache.del.restore();
        done();
      });
    });
  });
});
