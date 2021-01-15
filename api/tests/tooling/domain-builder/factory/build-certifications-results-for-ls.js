const { databaseBuilder, learningContentBuilder, mockLearningContent } = require('../../../test-helper');
const { status } = require('../../../../lib/domain/models/AssessmentResult');
const Assessment = require('../../../../lib/domain/models/Assessment');

const createdDate = new Date('2020-04-19');
const beforeCreatedDate = new Date('2020-04-18');
const beforeBeforeCreatedDate = new Date('2020-04-17');
const type = Assessment.types.CERTIFICATION;

function _createUser() {
  return databaseBuilder.factory.buildUser();
}

function _createSchoolingRegistration(userId, organizationId) {
  return databaseBuilder.factory.buildSchoolingRegistration(
    { userId, organizationId },
  );
}

function _createCertificationCenter() {
  const {
    id,
    name,
  } = databaseBuilder.factory.buildCertificationCenter({ name: 'Certif College' });
  return { certificationCenterId: id, certificationCenter: name };
}

function _buildCertificationData({ organizationId, isPublished, verificationCode }) {
  const userId = _createUser().id;
  const schoolingRegistration = _createSchoolingRegistration(userId, organizationId);
  const {
    id: certificationCenterId,
    name: certificationCenter,
  } = _createCertificationCenter();
  const session = databaseBuilder.factory.buildSession({
    certificationCenterId,
    certificationCenter,
    publishedAt: new Date('2020-02-21T14:23:56Z'),
  });

  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    userId,
    sessionId: session.id,
    isPublished,
    verificationCode,
  });

  databaseBuilder.factory.buildCertificationCourse({
    userId,
    sessionId: session.id,
    isPublished: false,
  });

  const assessment = databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationCourse.id,
    userId,
    type,
  });

  return {
    schoolingRegistration,
    session,
    certificationCourse,
    assessmentId: assessment.id,
  };
}

function _createAssessmentResultWithCompetenceMarks({
  assessmentId,
  pixScore = 500,
  status,
  createdAt,
  competenceMarks = [{}, {}],
}) {
  const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore,
    status,
    createdAt,
  });

  competenceMarks.forEach((cm) => {
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId: assessmentResult.id,
      competence_code: cm.code,
      level: cm.level,
    });
  });
}

function buildOrganization(uai) {
  return databaseBuilder.factory.buildOrganization({ externalId: uai });
}

const buildValidatedPublishedCertificationData = function({ organizationId, verificationCode, pixScore, competenceMarks }) {
  const certificationStatus = status.VALIDATED;
  const {
    schoolingRegistration,
    session,
    certificationCourse,
    assessmentId,
  } = _buildCertificationData({
    organizationId,
    verificationCode,
    type,
    pixScore,
    isPublished: true,
  });

  _createAssessmentResultWithCompetenceMarks({
    assessmentId,
    pixScore,
    status: certificationStatus,
    createdAt: createdDate,
    competenceMarks,
  });

  _createAssessmentResultWithCompetenceMarks({
    assessmentId,
    pixScore,
    status: certificationStatus,
    createdAt: beforeCreatedDate,
  });

  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore,
    status: certificationStatus,
    createdAt: beforeBeforeCreatedDate,
  });

  return {
    schoolingRegistration,
    session,
    certificationCourse,
  };
};

const buildRejectedPublishedCertificationData = function({ organizationId }) {
  const certificationStatus = status.REJECTED;
  const { assessmentId } = _buildCertificationData({
    organizationId,
    isPublished: true,
  });

  _createAssessmentResultWithCompetenceMarks({
    assessmentId,
    status: certificationStatus,
    createdAt: createdDate,
  });

};

const buildErrorUnpublishedCertificationData = function({ organizationId }) {
  const certificationStatus = status.REJECTED;
  const { assessmentId } = _buildCertificationData({
    organizationId,
    isPublished: false,
  });

  _createAssessmentResultWithCompetenceMarks({
    assessmentId,
    status: certificationStatus,
    createdAt: createdDate,
  });

};

const buildCertificationDataWithNoCompetenceMarks = function({ organizationId }) {
  const certificationStatus = status.REJECTED;
  const { assessmentId } = _buildCertificationData({
    organizationId,
    isPublished: false,
  });

  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    status: certificationStatus,
    createdAt: beforeBeforeCreatedDate,
  });
};

function mockLearningContentCompetences() {

  const learningContent = [{
    'id': 'rec99',
    code: '2',
    'titleFr': 'Communication et collaboration',
    'competences': [
      {
        'id': 'rec50',
        'index': '2.1',
        'name': 'Interagir',
        tubes: [],
      }, {
        'id': 'rec51',
        'index': '2.2',
        'name': 'Partager et publier',
        tubes: [],
      }, {
        'id': 'rec52',
        'index': '2.3',
        'name': 'Collaborer',
        tubes: [],
      },
    ],
  }, {
    'id': 'rec98',
    code: '3',
    'titleFr': 'Création de contenu',
    competences: [
      {
        'id': 'rec53',
        'index': '3.1',
        'name': 'Développer des documents textuels',
        tubes: [],
      },
      {
        'id': 'rec54',
        'index': '3.2',
        'name': 'Développer des documents multimedia',
        tubes: [],
      },
    ],
  }, {
    'id': 'rec97',
    code: '1',
    'titleFr': 'Information et données',
    competences: [
      {
        'id': 'rec55',
        'index': '1.1',
        'name': 'Mener une recherche et une veille d’information',
        tubes: [],
      },
      {
        'id': 'rec56',
        'index': '1.2',
        'name': 'Gérer des données',
        tubes: [],
      },
    ],
  }];

  const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
  mockLearningContent(learningContentObjects);
}

module.exports = {
  buildValidatedPublishedCertificationData,
  buildRejectedPublishedCertificationData,
  buildErrorUnpublishedCertificationData,
  buildCertificationDataWithNoCompetenceMarks,
  mockLearningContentCompetences,
  buildOrganization,
};
