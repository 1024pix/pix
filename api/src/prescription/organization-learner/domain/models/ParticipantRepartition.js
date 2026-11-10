class ParticipantRepartition {
  constructor(participantList = []) {
    this.totalRegisteredParticipant = participantList.filter(({ isAnonymous }) => !isAnonymous).length;
    this.totalUnRegisteredParticipant = participantList.filter(({ isAnonymous }) => isAnonymous).length;
  }

  static fromCounts({ totalRegisteredParticipant = 0, totalUnRegisteredParticipant = 0 } = {}) {
    const participantRepartition = new ParticipantRepartition();
    participantRepartition.totalRegisteredParticipant = totalRegisteredParticipant;
    participantRepartition.totalUnRegisteredParticipant = totalUnRegisteredParticipant;
    return participantRepartition;
  }
}

export { ParticipantRepartition };
