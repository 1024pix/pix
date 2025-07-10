import { status } from '../../../../src/shared/domain/models/AssessmentResult.js';
import { Assessment } from '../../../../src/shared/domain/models/index.js';
import { databaseBuilder } from '../../../test-helper.js';

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
  verificationCode,
}) {
  const { id: certificationCenterId, name: certificationCenter } = _createCertificationCenter();

  const session = databaseBuilder.factory.buildSession({
    certificationCenterId,
    certificationCenter,
  });

  const candidate = databaseBuilder.factory.buildCertificationCandidate({
    sessionId: session.id,
    organizationLearnerId: organizationLearner.id,
    firstName: organizationLearner.firstName,
    lastName: organizationLearner.lastName,
    birthdate: organizationLearner.birthdate,
    userId: user.id,
  });
  databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    userId: user.id,
    firstName: organizationLearner.firstName,
    lastName: organizationLearner.lastName,
    birthdate: organizationLearner.birthdate,
    sessionId: session.id,
    isPublished,
    createdAt: certificationCreatedDate || new Date(),
    verificationCode,
  });

  databaseBuilder.factory.buildCertificationCourse({
    userId: user.id,
    firstName: organizationLearner.firstName,
    lastName: organizationLearner.lastName,
    birthdate: organizationLearner.birthdate,
    sessionId: session.id,
    isPublished: false,
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

function buildCancelledCertificationData({ user, organizationLearner, certificationCreatedDate }) {
  return _buildCertificationResultsData({
    user,
    organizationLearner,
    certificationCreatedDate,
    isPublished: false,
    assessmentResultStatus: status.CANCELLED,
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
  return _buildCertificationResultsData({
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
  return _buildCertificationResultsData({
    user,
    organizationLearner,
    verificationCode,
    pixScore,
    certificationCreatedDate,
    competenceMarks,
    isPublished: false,
  });
}

function _buildCertificationResultsData({
  user,
  organizationLearner,
  verificationCode,
  pixScore,
  competenceMarks,
  certificationCreatedDate,
  isPublished,
  assessmentResultStatus = status.VALIDATED,
}) {
  const { session, certificationCourse, assessmentId } = _buildCertificationData({
    user,
    organizationLearner,
    verificationCode,
    type,
    pixScore,
    isPublished,
    certificationCreatedDate,
  });

  const { id: lastAssessmentResultId } = _createAssessmentResultWithCompetenceMarks({
    assessmentId,
    certificationCourseId: certificationCourse.id,
    pixScore,
    status: assessmentResultStatus,
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
    status: assessmentResultStatus,
    createdAt: assessmentBeforeCreatedDate,
  });

  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore,
    status: assessmentResultStatus,
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
  databaseBuilder.factory.learningContent.buildFramework({ id: 'frameworkId' });
  databaseBuilder.factory.learningContent.buildArea({
    frameworkId: 'frameworkId',
    id: 'rec99',
    code: '2',
    title_i18n: { fr: 'Communication et collaboration' },
    competenceIds: ['rec50', 'rec51', 'rec52'],
  });
  databaseBuilder.factory.learningContent.buildCompetence({
    id: 'rec50',
    index: '2.1',
    name_i18n: { fr: 'Interagir' },
    areaId: 'rec99',
    origin: 'Pix',
  });
  databaseBuilder.factory.learningContent.buildCompetence({
    id: 'rec51',
    index: '2.2',
    name_i18n: { fr: 'Partager et publier' },
    areaId: 'rec99',
    origin: 'Pix',
  });
  databaseBuilder.factory.learningContent.buildCompetence({
    id: 'rec52',
    index: '2.3',
    name_i18n: { fr: 'Collaborer' },
    areaId: 'rec99',
    origin: 'Pix',
  });
  databaseBuilder.factory.learningContent.buildArea({
    frameworkId: 'frameworkId',
    id: 'rec98',
    code: '3',
    title_i18n: { fr: 'Création de contenu' },
    competenceIds: ['rec53', 'rec54'],
  });
  databaseBuilder.factory.learningContent.buildCompetence({
    id: 'rec53',
    index: '3.1',
    name_i18n: { fr: 'Développer des documents textuels' },
    areaId: 'rec98',
    origin: 'Pix',
  });
  databaseBuilder.factory.learningContent.buildCompetence({
    id: 'rec54',
    index: '3.2',
    name_i18n: { fr: 'Développer des documents multimedia' },
    areaId: 'rec98',
    origin: 'Pix',
  });
  databaseBuilder.factory.learningContent.buildArea({
    frameworkId: 'frameworkId',
    id: 'rec97',
    code: '1',
    title_i18n: { fr: 'Information et données' },
    competenceIds: ['rec55', 'rec56'],
  });
  databaseBuilder.factory.learningContent.buildCompetence({
    id: 'rec55',
    index: '1.1',
    name_i18n: { fr: 'Mener une recherche et une veille d’information' },
    areaId: 'rec97',
    origin: 'Pix',
  });
  databaseBuilder.factory.learningContent.buildCompetence({
    id: 'rec56',
    index: '1.2',
    name_i18n: { fr: 'Gérer des données' },
    areaId: 'rec97',
    origin: 'Pix',
  });
}

export {
  buildCancelledCertificationData,
  buildCertificationDataWithNoCompetenceMarks,
  buildErrorUnpublishedCertificationData,
  buildOrganization,
  buildOrganizationLearner,
  buildRejectedPublishedCertificationData,
  buildUser,
  buildValidatedPublishedCertificationData,
  buildValidatedUnpublishedCertificationData,
  mockLearningContentCompetences,
};
