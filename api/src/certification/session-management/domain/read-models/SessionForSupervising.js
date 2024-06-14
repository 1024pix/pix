class SessionForSupervising {
  /**
   * @param {Object} params
   * @param {number} params.id
   * @param {date} params.date
   * @param {string} params.time
   * @param {string} params.examiner
   * @param {string} params.room
   * @param {Array<CertificationCandidateForSupervising|CertificationCandidateForSupervisingV3>} params.certificationCandidates
   * @param {string} params.accessCode
   * @param {string} params.address
   */
  constructor({ id, date, time, examiner, room, certificationCandidates, accessCode, address } = {}) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.examiner = examiner;
    this.room = room;
    this.certificationCandidates = certificationCandidates;
    this.accessCode = accessCode;
    this.address = address;
  }
}

export { SessionForSupervising };
