const Joi = require('@hapi/joi')
  .extend(require('@hapi/joi-date'));
const { InvalidCertificationCourseForFinalization } = require('../errors');

const certificationCourseSchemaForFinalization = Joi.object({
  id: Joi.number().optional(),
  birthplace: Joi.string().optional(),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').optional(),
  completedAt: Joi.string().optional(),
  createdAt: Joi.string().optional(),
  externalId: Joi.string().optional(),
  firstName: Joi.string().optional(),
  isPublished: Joi.boolean().optional(),
  lastName: Joi.string().optional(),
  isV2Certification: Joi.boolean().optional(),
  examinerComment: Joi.string().max(500).allow(null).optional(),
  hasSeenEndTestScreen: Joi.boolean().required(),
  assessment: Joi.string().optional(),
  challenges: Joi.string().optional(),
  userId: Joi.number().optional(),
  sessionId: Joi.number().optional(),
});

class CertificationCourse {
  constructor(
    {
      id,
      // attributes
      birthplace,
      birthdate,
      completedAt,
      createdAt,
      externalId,
      firstName,
      isPublished = false,
      lastName,
      isV2Certification = false,
      examinerComment,
      hasSeenEndTestScreen,
      // includes
      assessment,
      challenges,
      // references
      userId,
      sessionId,
    } = {}) {
    this.id = id;
    // attributes
    this.birthplace = birthplace;
    this.birthdate = birthdate;
    this.completedAt = completedAt;
    this.createdAt = createdAt;
    this.externalId = externalId;
    this.firstName = firstName;
    this.isPublished = isPublished;
    this.lastName = lastName;
    this.isV2Certification = isV2Certification;
    this.examinerComment = examinerComment;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    // includes
    this.assessment = assessment;
    this.challenges = challenges;
    // references
    this.userId = userId;
    this.sessionId = sessionId;
  }

  validateForFinalization() {
    const { error } = certificationCourseSchemaForFinalization.validate(this);
    if (error) {
      throw new InvalidCertificationCourseForFinalization(error);
    }
  }
}

module.exports = CertificationCourse;
