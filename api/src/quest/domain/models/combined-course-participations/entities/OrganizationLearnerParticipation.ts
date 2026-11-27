import { StatusesEnumValues } from '../../../../../devcomp/domain/models/module/UserModuleStatus.js';

export const OrganizationLearnerParticipationTypes = {
  PASSAGE: 'PASSAGE',
  COMBINED_COURSE: 'COMBINED_COURSE',
} as const;

export const OrganizationLearnerParticipationStatuses = {
  NOT_STARTED: 'NOT_STARTED',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
} as const;

type OrganizationLearnerParticipationType =
  (typeof OrganizationLearnerParticipationTypes)[keyof typeof OrganizationLearnerParticipationTypes];

type OrganizationLearnerParticipationStatus =
  (typeof OrganizationLearnerParticipationStatuses)[keyof typeof OrganizationLearnerParticipationStatuses];

type OrganizationLearnerParticipationArgs = {
  id?: number;
  organizationLearnerId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date | null;
  deletedAt?: Date | null;
  deletedBy?: number | null;
  status?: OrganizationLearnerParticipationStatus;
  type?: OrganizationLearnerParticipationType;
  referenceId?: string;
};

type BuildFromCombinedCourseArgs = {
  id: number;
  organizationLearnerId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedBy: number | null;
  status: OrganizationLearnerParticipationStatus;
  combinedCourseId: number;
};

type BuildFromPassageArgs = {
  id?: number;
  organizationLearnerId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  terminatedAt?: Date | null;
  deletedAt?: Date | null;
  deletedBy?: number | null;
  status: string;
  moduleId?: string;
};

export class OrganizationLearnerParticipation {
  id: number | undefined;
  organizationLearnerId: number | undefined;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  completedAt: Date | null | undefined;
  deletedAt: Date | null | undefined;
  deletedBy: number | null | undefined;
  status: OrganizationLearnerParticipationStatus | undefined;
  type: OrganizationLearnerParticipationType | undefined;
  referenceId: string | undefined;

  constructor({
    id,
    organizationLearnerId,
    createdAt,
    updatedAt,
    completedAt,
    deletedAt,
    deletedBy,
    status,
    type,
    referenceId,
  }: OrganizationLearnerParticipationArgs) {
    this.id = id;
    this.organizationLearnerId = organizationLearnerId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.completedAt = completedAt;
    this.deletedAt = deletedAt;
    this.deletedBy = deletedBy;
    this.status = status;
    this.type = type;
    this.referenceId = referenceId;
  }

  get isCompleted(): boolean {
    return this.status === OrganizationLearnerParticipationStatuses.COMPLETED;
  }

  complete(): void {
    const now = new Date();
    this.updatedAt = now;
    this.completedAt = now;
    this.status = OrganizationLearnerParticipationStatuses.COMPLETED;
  }

  get fieldsForUpdate() {
    return {
      id: this.id,
      updatedAt: this.updatedAt,
      status: this.status,
      completedAt: this.completedAt,
    };
  }

  static buildFromCombinedCourse({
    id,
    organizationLearnerId,
    createdAt,
    updatedAt,
    deletedAt,
    deletedBy,
    status,
    combinedCourseId,
  }: BuildFromCombinedCourseArgs): OrganizationLearnerParticipation {
    return new OrganizationLearnerParticipation({
      id,
      organizationLearnerId,
      createdAt,
      updatedAt,
      completedAt: status === OrganizationLearnerParticipationStatuses.COMPLETED ? updatedAt : null,
      deletedAt,
      deletedBy,
      status,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      referenceId: combinedCourseId.toString(),
    });
  }

  static buildFromPassage({
    id,
    organizationLearnerId,
    createdAt,
    updatedAt,
    terminatedAt,
    deletedAt,
    deletedBy,
    status,
    moduleId,
  }: BuildFromPassageArgs): OrganizationLearnerParticipation {
    let participationStatus: OrganizationLearnerParticipationStatus | undefined;

    if (status === StatusesEnumValues.IN_PROGRESS)
      participationStatus = OrganizationLearnerParticipationStatuses.STARTED;
    else if (status === StatusesEnumValues.COMPLETED)
      participationStatus = OrganizationLearnerParticipationStatuses.COMPLETED;
    else if (status == StatusesEnumValues.NOT_STARTED)
      participationStatus = OrganizationLearnerParticipationStatuses.NOT_STARTED;

    return new OrganizationLearnerParticipation({
      id,
      organizationLearnerId,
      createdAt,
      updatedAt,
      completedAt: terminatedAt,
      deletedAt,
      deletedBy,
      status: participationStatus,
      type: OrganizationLearnerParticipationTypes.PASSAGE,
      referenceId: moduleId,
    });
  }
}
