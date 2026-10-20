import { Frameworks } from '../../../../shared/domain/models/Frameworks.js';
import { CertificateMeshLevel } from '../../models/v3/CertificateMeshLevel.js';

export class CertificationResult {
  /**
   * @param {object} props
   * @param {string} props.[ine]
   * @param {string} props.[organizationUai]
   * @param {string} props.lastName
   * @param {string} props.firstName
   * @param {string} props.birthdate
   * @param {string} props.status
   * @param {string} props.pixScore
   * @param {number} props.certificationId
   * @param {string} props.certificationCodeVerification
   * @param {Date} props.certificationDate
   * @param {Date} props.certificationIssuedAt
   * @param {CertificateMeshLevel} props.maxReachableLevel
   * @param {number} props.maxReachablePixScore
   * @param {Array<Competence>} props.competences
   */
  constructor({
    ine,
    organizationUai,
    lastName,
    firstName,
    birthdate,
    status,
    pixScore,
    certificationId,
    certificationCodeVerification,
    certificationDate,
    certificationIssuedAt,
    maxReachableLevel,
    maxReachablePixScore,
    competences,
  }) {
    this.ine = ine;
    this.organizationUai = organizationUai;
    this.lastName = lastName;
    this.firstName = firstName;
    this.birthdate = birthdate;
    this.status = status;
    this.pixScore = pixScore;
    this.certificationId = certificationId;
    this.certificationCodeVerification = certificationCodeVerification;
    this.certificationDate = certificationDate;
    this.certificationIssuedAt = certificationIssuedAt;
    this.maxReachableLevel = maxReachableLevel;
    this.maxReachablePixScore = maxReachablePixScore;
    this.globalLevel = CertificateMeshLevel.buildFromScore({
      score: pixScore,
      maxReachableLevel,
      certificationFramework: Frameworks.CORE,
    });
    this.maxGlobalLevel = CertificateMeshLevel.buildMaxLevel({
      maxReachableLevel,
      certificationFramework: Frameworks.CORE,
    });
    this.competences = competences;
  }
}
