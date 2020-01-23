const _ = require('lodash');

const CertificationReport = require('../../domain/models/CertificationReport');

const CertificationCourseBookshelf = require('../data/certification-course');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter');

module.exports = {

  findBySessionId(sessionId) {
    return CertificationCourseBookshelf
      .where({ sessionId })
      .query((qb) => {
        qb.orderByRaw('LOWER("lastName") asc');
        qb.orderByRaw('LOWER("firstName") asc');
      })
      .fetchAll()
      .then((results) => {
        const certificationCourses = bookshelfToDomainConverter.buildDomainObjects(CertificationCourseBookshelf, results);

        return _.map(certificationCourses, CertificationReport.fromCertificationCourse);
      });
  },

};
