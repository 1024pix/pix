/* global sinon */
const { describe, it, before, after, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');

const Airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/cache');
const CourseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const courseSerializer = require('../../../../lib/infrastructure/serializers/airtable/course-serializer');

describe('Unit | Repository | course-repository', function () {

  let stub;

  beforeEach(function () {
    cache.flushAll();
    stub = sinon.stub(Airtable, 'base');
  });

  afterEach(function () {
    cache.flushAll();
    stub.restore();
  });

  /*
   * #list()
   */

  describe('#list()', function () {

    describe('when the courses have been previously fetched and cached', function () {

      it('should return the courses directly retrieved from the cache', function () {
        // given
        const cacheKey = 'course-repository_list';
        const cachedValue = [{ course: '1' }, { course: '2' }, { course: '3' }];
        cache.set(cacheKey, cachedValue);

        // when
        const result = CourseRepository.list();

        // then
        return expect(result).to.eventually.deep.equal(cachedValue);
      });

      it('should not make call to Airtable', function () {
        expect(stub.called).to.be.false;
      });

    });

    describe('when the cache throw an error', function () {

      const cacheErrorMessage = 'Cache error';

      before(function () {
        sinon.stub(cache, 'get', (key, callback) => {
          callback(new Error(cacheErrorMessage));
        });
      });

      after(function () {
        cache.get.restore();
      });

      it('should reject with thrown error', function () {
        // when
        const result = CourseRepository.list();

        // then
        return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      });

    });

    describe('when the courses have not been previously cached', function () {

      const record_1 = { id: 'course_1' };
      const record_2 = { id: 'course_2' };
      const record_3 = { id: 'course_3' };
      const records = [record_1, record_2, record_3];

      beforeEach(function () {
        stub.returns({
          select() {
            return {
              eachPage(pageCallback, cb) {
                pageCallback(records, cb);
              }
            };
          }
        });
      });

      it('should return the courses fetched from Airtable', function () {
        // given
        const courses = [
          courseSerializer.deserialize(record_1),
          courseSerializer.deserialize(record_2),
          courseSerializer.deserialize(record_3)
        ];

        // when
        const result = CourseRepository.list();

        // then
        return expect(result).to.eventually.deep.equal(courses);
      });

      it('should store the course in the cache', function () {
        // given
        const cacheKey = 'course-repository_list';

        // when
        CourseRepository.list().then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
          });
        });
      });
    });

  });

  /*
   * #get(id)
   */

  describe('#get(id)', function () {

    describe('when the course has been previously fetched and cached', function () {

      const courseId = 'courseId';
      const cacheKey = `course-repository_get_${courseId}`;
      const cachedValue = { foo: 'bar' };

      beforeEach(function () {
        // given
        cache.set(cacheKey, cachedValue);
      });

      it('should return the course directly retrieved from the cache', function () {
        // when
        const result = CourseRepository.get(courseId);

        // then
        return expect(result).to.eventually.deep.equal(cachedValue);
      });

      it('should not make call to Airtable', function () {
        // when
        CourseRepository.get(courseId);

        // then
        expect(stub.called).to.be.false;
      });

    });

    describe('when the cache throw an error', function () {

      const cacheErrorMessage = 'Cache error';

      before(function () {
        sinon.stub(cache, 'get', (key, callback) => {
          callback(new Error(cacheErrorMessage));
        });
      });

      after(function () {
        cache.get.restore();
      });

      it('should reject with thrown error', function () {
        // when
        const result = CourseRepository.get('course_id');

        // then
        return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      });

    });

    describe('when the course has not been previously cached', function () {

      const record = { id: 'course_id' };

      beforeEach(function () {
        stub.returns({
          find(id, callback) {
            if (record.id !== id) callback(new Error());
            return callback(null, record);
          }
        });
      });

      it('should return the course fetched from Airtable', function () {
        // given
        const course = courseSerializer.deserialize(record);

        // when
        const result = CourseRepository.get(course.id);

        // then
        return expect(result).to.eventually.deep.equal(course);
      });

      it('should store the course in the cache', function () {
        // given
        const courseId = 'course_id';

        // when
        CourseRepository.get(courseId);

        cache.get(`course-repository_get_${courseId}`, (err, cachedValue) => {
          expect(cachedValue).to.exist;
        });
      });
    });
  });

  /*
   * #refresh(id)
   */

  describe('#refresh(id)', function () {

    const record = {
      id: 'course_id',
      'fields': {
        'Consigne': 'Citez jusqu\'à 3 moteurs de recherche généralistes.',
        'Propositions': '${moteur 1}\n${moteur 2}\n${moteur 3}',
        'Type d\'épreuve': 'QROCM',
        'Bonnes réponses': '${moteur 1} ou ${moteur 2} ou ${moteur 3} = \nGoogle\nBing\nQwant\nDuckduckgo\nYahoo\nYahoo Search\nLycos\nAltavista\nHotbot'
      }
    };

    beforeEach(function () {
      stub.returns({
        find(id, callback) {
          if (record.id !== id) callback(new Error());
          return callback(null, record);
        }
      });
    });

    it('should return the course fetched from Airtable', function () {
      // given
      const course = courseSerializer.deserialize(record);

      // when
      const result = CourseRepository.refresh(course.id);

      // then
      return expect(result).to.eventually.deep.equal(course);
    });

    it('should store the course in the cache', function () {
      // given
      const courseId = 'course_id';

      // when
      CourseRepository.refresh(courseId);

      // then
      cache.get(`course-repository_get_${courseId}`, (err, cachedValue) => {
        expect(cachedValue).to.exist;
      });
    });

    describe('when the cache throw an error', function () {

      const cacheErrorMessage = 'Cache error';

      before(function () {
        sinon.stub(cache, 'del', (key, callback) => {
          callback(new Error(cacheErrorMessage));
        });
      });

      after(function () {
        cache.del.restore();
      });

      it('should reject with thrown error', function () {
        // when
        const result = CourseRepository.refresh('course_id');

        // then
        return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      });

    });

  });

})
;
