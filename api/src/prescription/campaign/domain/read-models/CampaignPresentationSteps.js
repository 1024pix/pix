class CampaignPresentationSteps {
  constructor({ campaignId, customLandingPageText, badges, competences }) {
    this.id = `${campaignId}_presentation-steps`;
    this.customLandingPageText = customLandingPageText;
    this.badges = badges;
    this.competences = competences;
  }
}

export { CampaignPresentationSteps };
