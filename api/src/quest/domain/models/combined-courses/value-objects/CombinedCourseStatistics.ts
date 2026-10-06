type CombinedCourseStatisticsArgs = {
  id: number;
  participationsCount: number;
  completedParticipationsCount: number;
};

export class CombinedCourseStatistics {
  id: number;
  participationsCount: number;
  completedParticipationsCount: number;

  constructor({ id, participationsCount, completedParticipationsCount }: CombinedCourseStatisticsArgs) {
    this.id = id;
    this.participationsCount = participationsCount;
    this.completedParticipationsCount = completedParticipationsCount;
  }
}
