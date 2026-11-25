type CombinedCourseStatisticsArgs = {
  combinedCourseId: number;
  participationsCount: number;
  completedParticipationsCount: number;
};

export class CombinedCourseStatistics {
  combinedCourseId: number;
  participationsCount: number;
  completedParticipationsCount: number;

  constructor({ combinedCourseId, participationsCount, completedParticipationsCount }: CombinedCourseStatisticsArgs) {
    this.combinedCourseId = combinedCourseId;
    this.participationsCount = participationsCount;
    this.completedParticipationsCount = completedParticipationsCount;
  }
}
