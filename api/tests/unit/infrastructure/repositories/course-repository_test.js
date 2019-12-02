const { expect, sinon } = require('../../../test-helper');
const _ = require('lodash');

const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const Course = require('../../../../lib/domain/models/Course');
const courseDatasource = require('../../../../lib/infrastructure/datasources/airtable/course-datasource');

describe('Unit | Repository | course-repository', function() {

  describe('#get', function() {

    beforeEach(() => {
      sinon.stub(courseDatasource, 'get')
        .withArgs('recTestAdaptative')
        .resolves({
          id: 'recTestAdaptative',
          name: 'adaptive-course-name',
          adaptive: true,
          description: 'course-description',
          imageUrl: 'http://example.org/course.png',
          challenges: ['recChallenge1', 'recChallenge2'],
          competences: ['recCompetence'],
        });
    });

    it('should return Course domain objects', () => {
      // when
      const promise = courseRepository.get('recTestAdaptative');

      // then
      return promise.then((course) => {
        expect(course).to.be.an.instanceOf(Course);
        expect(course.id).to.equal('recTestAdaptative');
        expect(course.type).to.equal('PLACEMENT');
        expect(course.description).to.equal('course-description');
        expect(course.imageUrl).to.equal('http://example.org/course.png');
        expect(course.challenges).to.deep.equal(['recChallenge2', 'recChallenge1']);
        expect(course.competences).to.deep.equal(['recCompetence']);
      });
    });

  });

  describe('#getAdaptiveCourses', () => {

    beforeEach(() => {
      sinon.stub(courseDatasource, 'getAdaptiveCourses')
        .resolves([{
          id: 'recTestAdaptative',
          name: 'adaptive-course-name',
        }]);
    });

    it('should return Course domain objects', () => {
      // when
      const promise = courseRepository.getAdaptiveCourses();

      // then
      return promise.then((courses) => {
        expect(_.map(courses, 'id')).to.deep.equal(['recTestAdaptative']);
        expect(courses[0]).to.be.an.instanceOf(Course);
      });
    });

  });

  describe('#getCourseName', function() {

    beforeEach(() => {
      sinon.stub(courseDatasource, 'get')
        .withArgs('recTestAdaptative')
        .resolves({
          id: 'recTestAdaptative',
          name: 'adaptive-course-name',
          adaptive: true,
        });
    });

    it('should return Course domain objects', () => {
      // when
      const promise = courseRepository.getCourseName('recTestAdaptative');

      // then
      return promise.then((courseName) => {
        expect(courseName).to.equal('adaptive-course-name');
      });
    });

  });

});
