const { describe, it, beforeEach, afterEach, expect, sinon } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/cache');
const airtable = require('../../../../lib/infrastructure/airtable');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const courseSerializer = require('../../../../lib/infrastructure/serializers/airtable/course-serializer');

function _buildCourse(id, name, description) {
  return { id, name, description };
}

describe('Unit | Repository | course-repository', function () {

  let getRecord;
  let getRecords;

  beforeEach(function () {
    cache.flushAll();
    getRecord = sinon.stub(airtable, 'getRecord');
    getRecords = sinon.stub(airtable, 'getRecords');
  });

  afterEach(function () {
    cache.flushAll();
    getRecord.restore();
    getRecords.restore();
  });

  /*
   * #get
   */

  describe('#get', function () {

    const courseId = 'courseId';
    const cacheKey = `course-repository_get_${courseId}`;
    const course = { foo: 'bar' };

    it('should resolve with the course directly retrieved from the cache without calling airtable when the course has been cached', function (done) {
      // given
      getRecord.resolves(true);
      cache.set(cacheKey, course);

      // when
      const result = courseRepository.get(courseId);

      // then
      expect(getRecord.notCalled).to.be.true;
      expect(result).to.eventually.deep.equal(course);
      done();
    });

    it('should reject with an error when the cache throw an error', function (done) {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get', (key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = courseRepository.get(courseId);

      // then
      cache.get.restore();
      expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      done();
    });

    describe('when the course was not previously cached', function () {

      beforeEach(function () {
        getRecord.resolves(course);
      });

      it('should resolve with the courses fetched from airtable', function (done) {
        // when
        const result = courseRepository.get(courseId);

        // then
        expect(result).to.eventually.deep.equal(course);
        done();
      });

      it('should cache the course fetched from airtable', function (done) {
        // when
        courseRepository.get(courseId).then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly airtable', function (done) {
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

  describe('#refresh', function () {

    const courseId = 'course_id';
    const cacheKey = `course-repository_get_${courseId}`;

    it('should reject with an error when the cache throw an error', function (done) {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'del', (key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = courseRepository.refresh(courseId);

      // then
      cache.del.restore();
      expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      done();
    });

    it('should resolve with the course fetched from airtable when the course was not previously cached', function (done) {
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
      expect(result).to.eventually.deep.equal(course);
      done();
    });

    it('should replace the old course by the new one in cache', function () {
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
        });
      });
    });
  });

  /*
   * #getProgressionTests
   */

  describe('#getProgressionTests', function () {

    const cacheKey = 'course-repository_getProgressionTests';
    const courses = [
      _buildCourse('course_id_1', 'Course #1', 'Desc. #1'),
      _buildCourse('course_id_2', 'Course #2', 'Desc. #2'),
      _buildCourse('course_id_3', 'Course #3', 'Desc. #3')
    ];

    it('should reject with an error when the cache throw an error', function (done) {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get', (key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = courseRepository.getProgressionTests();

      // then
      cache.get.restore();
      expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      done();
    });

    it('should resolve with the course directly retrieved from the cache without calling airtable when the course has been cached', function (done) {
      // given
      getRecords.resolves(true);
      cache.set(cacheKey, courses);

      // when
      const result = courseRepository.getProgressionTests();

      // then
      expect(getRecords.notCalled).to.be.true;
      expect(result).to.eventually.deep.equal(courses);
      done();
    });

    describe('when courses have not been previsously cached', function () {

      beforeEach(function () {
        getRecords.resolves(courses);
      });

      it('should resolve with the courses fetched from airtable', function (done) {
        // when
        const result = courseRepository.getProgressionTests();

        // then
        expect(result).to.eventually.deep.equal(courses);
        done();
      });

      it('should cache the course fetched from airtable', function (done) {
        // when
        courseRepository.getProgressionTests().then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly airtable', function (done) {
        // given
        const expectedQuery = {
          sort: [{ field: 'Ordre affichage', direction: 'asc' }],
          view: 'Tests de progression'
        };

        // when
        courseRepository.getProgressionTests().then(() => {

          // then
          expect(getRecords.calledWith('Tests', expectedQuery, courseSerializer)).to.be.true;
          done();
        });
      });
    });

  });

  /*
   * #getCoursesOfTheWeek
   */

  describe('#getCoursesOfTheWeek', function () {

    const cacheKey = 'course-repository_getCoursesOfTheWeek';
    const courses = [
      _buildCourse('course_id_1', 'Course #1', 'Desc. #1'),
      _buildCourse('course_id_2', 'Course #2', 'Desc. #2'),
      _buildCourse('course_id_3', 'Course #3', 'Desc. #3')
    ];

    it('should reject with an error when the cache throw an error', function (done) {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get', (key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = courseRepository.getCoursesOfTheWeek();

      // then
      cache.get.restore();
      expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      done();
    });

    it('should resolve with the courses directly retrieved from the cache without calling airtable when the course has been cached', function (done) {
      // given
      getRecords.resolves(true);
      cache.set(cacheKey, courses);

      // when
      const result = courseRepository.getCoursesOfTheWeek();

      // then
      expect(getRecords.notCalled).to.be.true;
      expect(result).to.eventually.deep.equal(courses);
      done();
    });

    describe('when courses have not been previsously cached', function () {

      beforeEach(function () {
        getRecords.resolves(courses);
      });

      it('should resolve with the courses fetched from airtable', function (done) {
        // when
        const result = courseRepository.getCoursesOfTheWeek();

        // then
        expect(result).to.eventually.deep.equal(courses);
        done();
      });

      it('should cache the course fetched from airtable', function (done) {
        // when
        courseRepository.getCoursesOfTheWeek().then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly airtable', function (done) {
        // given
        const expectedQuery = {
          sort: [{ field: 'Ordre affichage', direction: 'asc' }],
          view: 'Défis de la semaine'
        };

        // when
        courseRepository.getCoursesOfTheWeek().then(() => {

          // then
          expect(getRecords.calledWith('Tests', expectedQuery, courseSerializer)).to.be.true;
          done();
        });
      });
    });

  });

  /*
   * #getAdaptiveCourses
   */

  describe('#getAdaptiveCourses', function () {

    const cacheKey = 'course-repository_getAdaptiveCourses';
    const courses = [
      _buildCourse('course_id_1', 'Course #1', 'Desc. #1'),
      _buildCourse('course_id_2', 'Course #2', 'Desc. #2'),
      _buildCourse('course_id_3', 'Course #3', 'Desc. #3')
    ];

    it('should reject with an error when the cache throw an error', function (done) {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get', (key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = courseRepository.getAdaptiveCourses();

      // then
      cache.get.restore();
      expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      done();
    });

    it('should resolve with the courses directly retrieved from the cache without calling airtable when the course has been cached', function (done) {
      // given
      getRecords.resolves(true);
      cache.set(cacheKey, courses);

      // when
      const result = courseRepository.getAdaptiveCourses();

      // then
      expect(getRecords.notCalled).to.be.true;
      expect(result).to.eventually.deep.equal(courses);
      done();
    });

    describe('when courses have not been previsously cached', function () {

      beforeEach(function () {
        getRecords.resolves(courses);
      });

      it('should resolve with the courses fetched from airtable', function (done) {
        // when
        const result = courseRepository.getAdaptiveCourses();

        // then
        expect(result).to.eventually.deep.equal(courses);
        done();
      });

      it('should cache the course fetched from airtable', function (done) {
        // when
        courseRepository.getAdaptiveCourses().then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly airtable', function (done) {
        // given
        const expectedQuery = {
          sort: [{ field: 'Ordre affichage', direction: 'asc' }],
          view: 'Tests de positionnement'
        };

        // when
        courseRepository.getAdaptiveCourses().then(() => {

          // then
          expect(getRecords.calledWith('Tests', expectedQuery, courseSerializer)).to.be.true;
          done();
        });
      });
    });
  });
});
