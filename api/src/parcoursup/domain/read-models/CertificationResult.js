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
   * @param {Array<Object>} props.competences
   *        @param {string} props.competences.competence_code
   *        @param {string} props.competences.competence_name
   *        @param {string} props.competences.area_name
   *        @param {string} props.competences.competence_level
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
