class SessionForAttendanceSheet {
  constructor({
    id,
    date,
    time,
    address,
    room,
    examiner,
    certificationCenterName,
    certificationCenterType,
    certificationCandidates,
    isOrganizationManagingStudents,
  }) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.address = address;
    this.room = room;
    this.examiner = examiner;
    this.certificationCenterName = certificationCenterName;
    this.certificationCenterType = certificationCenterType;
    this.certificationCandidates = certificationCandidates;
    this.isOrganizationManagingStudents = isOrganizationManagingStudents;
  }
}

export default SessionForAttendanceSheet;
