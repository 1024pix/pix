/**
 * @typedef {import('../models/Candidate.js').Candidate} Candidate
 */
import _ from 'lodash';

export class EnrolledCandidate {
  constructor({
    id,
    firstName,
    lastName,
    sex,
    birthPostalCode,
    birthINSEECode,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    externalId,
    birthdate,
    extraTimePercentage,
    isLinked,
    organizationLearnerId,
    complementaryCertificationId,
    complementaryCertificationLabel,
    complementaryCertificationKey,
    billingMode,
    prepaymentCode,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthCity = birthCity;
    this.birthProvinceCode = birthProvinceCode;
    this.birthCountry = birthCountry;
    this.birthPostalCode = birthPostalCode;
    this.birthINSEECode = birthINSEECode;
    this.sex = sex;
    this.email = email;
    this.resultRecipientEmail = resultRecipientEmail;
    this.externalId = externalId;
    this.birthdate = birthdate;
    this.extraTimePercentage = !_.isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : null;
    this.isLinked = !!isLinked;
    this.organizationLearnerId = organizationLearnerId;
    this.complementaryCertificationId = complementaryCertificationId;
    this.complementaryCertificationLabel = complementaryCertificationLabel;
    this.complementaryCertificationKey = complementaryCertificationKey;
    this.billingMode = billingMode;
    this.prepaymentCode = prepaymentCode;
  }

  /**
   * @param {Object} params
   * @param {Candidate} params.candidate (mandatory) candidate information
   * @param {Object} params.complementaryCertification (optionnal) candidate information
   * @returns {EnrolledCandidate}
   */
  static fromCandidateAndComplementaryCertification({ candidate, complementaryCertification }) {
    const { id, label, key } = complementaryCertification ?? {};

    return new EnrolledCandidate({
      ...candidate,
      isLinked: candidate.isLinkedToAUser(),
      complementaryCertificationId: id,
      complementaryCertificationLabel: label,
      complementaryCertificationKey: key,
    });
  }
}
