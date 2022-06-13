class OrganizationForAdmin {
  constructor({
    id,
    name,
    type,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    credit,
    email,
    documentationUrl,
    createdBy,
    showNPS,
    formNPSUrl,
    showSkills,
    archivedAt,
    archivistFirstName,
    archivistLastName,
    creatorFirstName,
    creatorLastName,
    tags = [],
  } = {}) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.logoUrl = logoUrl;
    this.externalId = externalId;
    this.provinceCode = provinceCode;
    this.isManagingStudents = isManagingStudents;
    this.credit = credit;
    this.email = email;
    this.documentationUrl = documentationUrl;
    this.createdBy = createdBy;
    this.showNPS = showNPS;
    this.formNPSUrl = formNPSUrl;
    this.showSkills = showSkills;
    this.archivedAt = archivedAt;
    this.archivistFirstName = archivistFirstName;
    this.archivistLastName = archivistLastName;
    this.creatorFirstName = creatorFirstName;
    this.creatorLastName = creatorLastName;
    this.tags = tags;
  }

  get archivistFullName() {
    return this.archivistFirstName && this.archivistLastName
      ? `${this.archivistFirstName} ${this.archivistLastName}`
      : null;
  }

  get creatorFullName() {
    return this.creatorFirstName && this.creatorLastName ? `${this.creatorFirstName} ${this.creatorLastName}` : null;
  }
}

module.exports = OrganizationForAdmin;
