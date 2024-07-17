class ParticipantRepartition {
  constructor(participantList = []) {
    this.totalRegisteredParticipant = participantList.filter(({ isAnonymous }) => !isAnonymous).length;
    this.totalUnRegisteredParticipant = participantList.filter(({ isAnonymous }) => isAnonymous).length;
  }
}

export { ParticipantRepartition };
