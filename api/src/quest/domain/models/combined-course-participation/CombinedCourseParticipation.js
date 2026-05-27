import { CombinedCourseParticipationStatuses } from '../../../../prescription/shared/domain/constants.js';

export class CombinedCourseParticipation {
  constructor({
    id,
    firstName,
    lastName,
    division,
    group,
    organizationLearnerId,
    status,
    updatedAt,
    createdAt,
    referenceId,
  }) {
    this.id = id;
    this.combinedCourseId = Number(referenceId);
    this.organizationLearnerId = organizationLearnerId;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.division = division;
    this.group = group;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  complete() {
    this.updatedAt = new Date();
    this.status = CombinedCourseParticipationStatuses.COMPLETED;
  }

  isCompleted() {
    return this.status === CombinedCourseParticipationStatuses.COMPLETED;
  }
}
