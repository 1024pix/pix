class ParticipationResultCalculationJobHandler {
  constructor({ participantResultsSharedRepository, campaignParticipationRepository }) {
    this.participantResultsSharedRepository = participantResultsSharedRepository;
    this.campaignParticipationRepository = campaignParticipationRepository;
  }

  async handle(event) {
    const { campaignParticipationId } = event;
    const participantResultsShared = await this.participantResultsSharedRepository.get(campaignParticipationId);
    await this.participantResultsSharedRepository.save(participantResultsShared);
  }
}

module.exports = ParticipationResultCalculationJobHandler;
