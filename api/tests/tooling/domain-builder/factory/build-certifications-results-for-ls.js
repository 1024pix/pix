const { databaseBuilder, learningContentBuilder, mockLearningContent } = require('../../../test-helper');
const { status } = require('../../../../lib/domain/models/AssessmentResult');
const Assessment = require('../../../../lib/domain/models/Assessment');

const assessmentCreatedDate = new Date('2020-04-19');
const assessmentBeforeCreatedDate = new Date('2020-04-18');
const assessmentBeforeBeforeCreatedDate = new Date('2020-04-17');
const type = Assessment.types.CERTIFICATION;

function buildUser() {
  return databaseBuilder.factory.buildUser();
}

function buildOrganizationLearner({ userId, organizationId, isDisabled }) {
  return databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId, isDisabled });
}

function _createCertificationCenter() {
  const { id, name } = databaseBuilder.factory.buildCertificationCenter({ name: 'Certif College' });
  return { certificationCenterId: id, certificationCenter: name };
}

function _buildCertificationData({
  user,
  organizationLearner,
  certificationCreatedDate,
  isPublished,
  isCancelled,
  verificationCode,
}) {
  const { id: certificationCenterId, name: certificationCenter } = _createCertificationCenter();

  const session = databaseBuilder.factory.buildSession({
    certificationCenterId,
    certificationCenter,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    sessionId: session.id,
    organizationLearnerId: organizationLearner.id,
    firstName: organizationLearner.firstName,
    lastName: organizationLearner.lastName,
    birthdate: organizationLearner.birthdate,
    userId: user.id,
  });

  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    userId: user.id,
    firstName: organizationLearner.firstName,
    lastName: organizationLearner.lastName,
    birthdate: organizationLearner.birthdate,
    sessionId: session.id,
    isPublished,
    createdAt: certificationCreatedDate || new Date(),
    verificationCode,
    isCancelled,
  });

  databaseBuilder.factory.buildCertificationCourse({
    userId: user.id,
    firstName: organizationLearner.firstName,
    lastName: organizationLearner.lastName,
    birthdate: organizationLearner.birthdate,
    sessionId: session.id,
    isPublished: false,
    isCancelled,
  });

  const assessment = databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationCourse.id,
    firstName: organizationLearner.firstName,
    lastName: organizationLearner.lastName,
    birthdate: organizationLearner.birthdate,
    userId: user.id,
    type,
  });

  return {
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

  return assessmentResult;
}

function buildOrganization(uai) {
  return databaseBuilder.factory.buildOrganization({ externalId: uai });
}

function buildCancelledCertificationData({
  user,
  organizationLearner,
  verificationCode,
  pixScore,
  competenceMarks,
  certificationCreatedDate,
}) {
  return _buildValidatedCertificationData({
    user,
    organizationLearner,
    verificationCode,
    pixScore,
    certificationCreatedDate,
    competenceMarks,
    isPublished: false,
    isCancelled: true,
  });
}

function buildValidatedPublishedCertificationData({
  user,
  organizationLearner,
  verificationCode,
  pixScore,
  competenceMarks,
  certificationCreatedDate,
}) {
  return _buildValidatedCertificationData({
    user,
    organizationLearner,
    verificationCode,
    pixScore,
    certificationCreatedDate,
    competenceMarks,
    isPublished: true,
  });
}

function buildValidatedUnpublishedCertificationData({
  user,
  organizationLearner,
  verificationCode,
  pixScore,
  competenceMarks,
  certificationCreatedDate,
}) {
  return _buildValidatedCertificationData({
    user,
    organizationLearner,
    verificationCode,
    pixScore,
    certificationCreatedDate,
    competenceMarks,
    isPublished: false,
  });
}

function _buildValidatedCertificationData({
  user,
  organizationLearner,
  verificationCode,
  pixScore,
  competenceMarks,
  certificationCreatedDate,
  isPublished,
  isCancelled = false,
}) {
  const certificationStatus = status.VALIDATED;
  const { session, certificationCourse, assessmentId } = _buildCertificationData({
    user,
    organizationLearner,
    verificationCode,
    type,
    pixScore,
    isPublished,
    isCancelled,
    certificationCreatedDate,
  });

  const { id: lastAssessmentResultId } = _createAssessmentResultWithCompetenceMarks({
    assessmentId,
    certificationCourseId: certificationCourse.id,
    pixScore,
    status: certificationStatus,
    createdAt: assessmentCreatedDate,
    competenceMarks,
  });

  databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
    certificationCourseId: certificationCourse.id,
    lastAssessmentResultId,
  });

  _createAssessmentResultWithCompetenceMarks({
    assessmentId,
    certificationCourseId: certificationCourse.id,
    pixScore,
    status: certificationStatus,
    createdAt: assessmentBeforeCreatedDate,
  });

  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore,
    status: certificationStatus,
    createdAt: assessmentBeforeBeforeCreatedDate,
  });

  return {
    session,
    certificationCourse,
  };
}

function buildRejectedPublishedCertificationData({
  user,
  organizationLearner,
  competenceMarks,
  certificationCreationDate,
}) {
  const certificationStatus = status.REJECTED;
  const { assessmentId, certificationCourse } = _buildCertificationData({
    user,
    organizationLearner,
    isPublished: true,
    createdAt: certificationCreationDate,
  });

  const { id: lastAssessmentResultId } = _createAssessmentResultWithCompetenceMarks({
    assessmentId,
    status: certificationStatus,
    createdAt: assessmentCreatedDate,
    competenceMarks,
  });

  databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
    certificationCourseId: certificationCourse.id,
    lastAssessmentResultId,
  });
}

function buildErrorUnpublishedCertificationData({ user, organizationLearner, competenceMarks }) {
  const certificationStatus = status.REJECTED;
  const { assessmentId, certificationCourse } = _buildCertificationData({
    user,
    organizationLearner,
    isPublished: false,
  });

  const { id: lastAssessmentResultId } = _createAssessmentResultWithCompetenceMarks({
    assessmentId,
    status: certificationStatus,
    createdAt: assessmentCreatedDate,
    competenceMarks,
  });

  databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
    certificationCourseId: certificationCourse.id,
    lastAssessmentResultId,
  });
}

function buildCertificationDataWithNoCompetenceMarks({ user, organizationLearner }) {
  const certificationStatus = status.REJECTED;
  const { assessmentId, certificationCourse } = _buildCertificationData({
    user,
    organizationLearner,
    publicationDate: null,
  });

  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    certificationCourseId: certificationCourse.id,
    status: certificationStatus,
    createdAt: assessmentBeforeBeforeCreatedDate,
  });
}

function mockLearningContentCompetences() {
  const learningContent = [
    {
      id: 'rec99',
      code: '2',
      titleFr: 'Communication et collaboration',
      competences: [
        {
          id: 'rec50',
          index: '2.1',
          name: 'Interagir',
          tubes: [],
        },
        {
          id: 'rec51',
          index: '2.2',
          name: 'Partager et publier',
          tubes: [],
        },
        {
          id: 'rec52',
          index: '2.3',
          name: 'Collaborer',
          tubes: [],
        },
      ],
    },
    {
      id: 'rec98',
      code: '3',
      titleFr: 'Création de contenu',
      competences: [
        {
          id: 'rec53',
          index: '3.1',
          name: 'Développer des documents textuels',
          tubes: [],
        },
        {
          id: 'rec54',
          index: '3.2',
          name: 'Développer des documents multimedia',
          tubes: [],
        },
      ],
    },
    {
      id: 'rec97',
      code: '1',
      titleFr: 'Information et données',
      competences: [
        {
          id: 'rec55',
          index: '1.1',
          name: 'Mener une recherche et une veille d’information',
          tubes: [],
        },
        {
          id: 'rec56',
          index: '1.2',
          name: 'Gérer des données',
          tubes: [],
        },
      ],
    },
  ];

  const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
  mockLearningContent(learningContentObjects);
}

module.exports = {
  buildValidatedPublishedCertificationData,
  buildValidatedUnpublishedCertificationData,
  buildCancelledCertificationData,
  buildRejectedPublishedCertificationData,
  buildErrorUnpublishedCertificationData,
  buildCertificationDataWithNoCompetenceMarks,
  mockLearningContentCompetences,
  buildOrganization,
  buildUser,
  buildOrganizationLearner,
};
