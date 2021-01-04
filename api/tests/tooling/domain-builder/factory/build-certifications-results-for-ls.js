const { databaseBuilder, learningContentBuilder, mockLearningContent } = require('../../../test-helper');
const { status } = require('../../../../lib/domain/models/AssessmentResult');

function _createUser() {
  return databaseBuilder.factory.buildUser();
}

function _createOrganization(uai) {
  return databaseBuilder.factory.buildOrganization({ externalId: uai });
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

function _buildCertificationData({ uai, isPublished, status, verificationCode, type, pixScore, competenceMarks = [] }) {
  const userId = _createUser().id;
  const organizationId = _createOrganization(uai).id;
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

  const createdDate = new Date('2020-04-19');
  const beforeCreatedDate = new Date('2020-04-18');
  const beforeBeforeCreatedDate = new Date('2020-04-17');

  const assessmentResult = _createAssessmentResultWithCompetenceMarks({
    assessmentId: assessment.id,
    pixScore,
    status,
    createdAt: createdDate,
    competenceMarks,
  });

  _createAssessmentResultWithCompetenceMarks({
    assessmentId: assessment.id,
    pixScore,
    status,
    createdAt: beforeCreatedDate,
    competenceMarks: [{}, {}],
  });

  databaseBuilder.factory.buildAssessmentResult({
    assessmentId: assessment.id,
    pixScore,
    status,
    createdAt: beforeBeforeCreatedDate,
  });

  return {
    schoolingRegistration,
    session,
    certificationCourse,
    assessmentResult,
    competenceMarks: assessmentResult.competenceMarks,
  };
}

function _createAssessmentResultWithCompetenceMarks({
  assessmentId,
  pixScore,
  status,
  createdAt,
  competenceMarks,
}) {
  const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore,
    status,
    createdAt,
  });

  const createdCompetenceMarks = competenceMarks.forEach((cm) => {
    return databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId: assessmentResult.id,
      competence_code: cm.code,
      level: cm.level,
    });
  });

  return { assessmentResult, competenceMarks: createdCompetenceMarks };
}

const buildValidatedPublishedCertificationData = function({ uai, verificationCode, type, pixScore, competenceMarks }) {
  return _buildCertificationData({
    uai,
    verificationCode,
    type,
    pixScore,
    isPublished: true,
    status: status.VALIDATED,
    competenceMarks,
  });
};

const buildRejectedPublishedCertificationData = function({ uai, verificationCode, type, pixScore }) {
  return _buildCertificationData({ uai, verificationCode, type, pixScore, isPublished: true, status: status.REJECTED });
};

const buildErrorUnpublishedCertificationData = function({ uai, verificationCode, type, pixScore }) {
  return _buildCertificationData({ uai, verificationCode, type, pixScore, isPublished: false, status: status.ERROR });
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
  mockLearningContentCompetences,
};
