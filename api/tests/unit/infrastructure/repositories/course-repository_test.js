const { expect, sinon } = require('../../../test-helper');

const AirtableResourceNotFound = require(
  '../../../../lib/infrastructure/datasources/airtable/AirtableResourceNotFound');
const { NotFoundError } = require('../../../../lib/domain/errors');

const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const Course = require('../../../../lib/domain/models/Course');
const courseDatasource = require('../../../../lib/infrastructure/datasources/airtable/course-datasource');

describe('Unit | Repository | course-repository', function() {

  describe('#get', function() {

    context('when the course exists', () => {

      beforeEach(() => {
        sinon.stub(courseDatasource, 'get')
          .withArgs('recTest1')
          .resolves({
            id: 'recTest1',
            name: 'a-course-name',
            adaptive: false,
            description: 'course-description',
            imageUrl: 'http://example.org/course.png',
            challenges: ['recChallenge1', 'recChallenge2'],
            competences: ['recCompetence'],
          });
      });

      it('should return Course domain objects', () => {
        // when
        const promise = courseRepository.get('recTest1');

        // then
        return promise.then((course) => {
          expect(course).to.be.an.instanceOf(Course);
          expect(course.id).to.equal('recTest1');
          expect(course.name).to.equal('a-course-name');
          expect(course.description).to.equal('course-description');
          expect(course.imageUrl).to.equal('http://example.org/course.png');
          expect(course.challenges).to.deep.equal(['recChallenge1', 'recChallenge2']);
          expect(course.competences).to.deep.equal(['recCompetence']);
        });
      });
    });

    context('when the course does not exist', () => {

      beforeEach(() => {
        const error = new AirtableResourceNotFound();
        sinon.stub(courseDatasource, 'get');
        courseDatasource.get.rejects(error);
      });

      it('should reject with a NotFoundError if the course is not found', () => {
        // when
        const promise = courseRepository.get('rec_missing');

        // then
        return expect(promise).to.have.been.rejectedWith(NotFoundError);
      });
    });

  });

  describe('#getCourseName', function() {

    beforeEach(() => {
      sinon.stub(courseDatasource, 'get')
        .withArgs('recTest2')
        .resolves({
          id: 'recTest2',
          name: 'a-course-name',
        });
    });

    it('should return Course domain objects', () => {
      // when
      const promise = courseRepository.getCourseName('recTest2');

      // then
      return promise.then((courseName) => {
        expect(courseName).to.equal('a-course-name');
      });
    });

  });

});
