/**
 * @typedef {import('./Competence.js').Competence} Competence
 */

export class CertificationResult {
  /**
   * @param {Object} props
   * @param {string} props.[ine]
   * @param {string} props.[organizationUai]
   * @param {string} props.lastName
   * @param {string} props.firstName
   * @param {string} props.birthdate
   * @param {string} props.status
   * @param {string} props.pixScore
   * @param {Date} props.certificationDate
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
    certificationDate,
    competences,
  }) {
    this.ine = ine;
    this.organizationUai = organizationUai;
    this.lastName = lastName;
    this.firstName = firstName;
    this.birthdate = birthdate;
    this.status = status;
    this.pixScore = pixScore;
    this.certificationDate = certificationDate;
    this.competences = competences;
  }
}
