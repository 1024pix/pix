import { MAX_REACHABLE_SCORE } from '../../../../shared/domain/constants.js';
import { GlobalCertificationLevel } from './v3/GlobalCertificationLevel.js';

export class V3Certificate {
  /**
   * @param {Object} props
   * @param {number} props.id - certification course id
   * @param {string} props.firstName
   * @param {string} props.lastName
   * @param {Date} props.birthdate
   * @param {string} props.birthplace
   * @param {string} props.certificationCenter - center name
   * @param {string} props.pixScore
   * @param {GlobalCertificationLevel} props.[globalLevel] - auto calculated
   * @param {string} props.verificationCode
   * @param {Array<ResultCompetenceTree>} props.resultCompetenceTree
   * @param {AlgorithmEngineVersion} props.algorithmEngineVersion
   */
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    certificationCenter,
    deliveredAt,
    pixScore,
    verificationCode,
    resultCompetenceTree,
    algorithmEngineVersion,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.deliveredAt = deliveredAt;
    this.certificationCenter = certificationCenter;
    this.pixScore = pixScore;
    this.globalLevel = new GlobalCertificationLevel({ score: pixScore });
    this.verificationCode = verificationCode;
    this.maxReachableScore = MAX_REACHABLE_SCORE;
    this.resultCompetenceTree = resultCompetenceTree;
    this.algorithmEngineVersion = algorithmEngineVersion;
  }
}
