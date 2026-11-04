import { CampaignOverview } from './CampaignOverview.js';

export class CampaignOverviewWithCompetences extends CampaignOverview {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {string} props.code
   * @param {string} props.name
   * @param {string} props.type
   * @param {string} props.organizationName
   * @param {string} props.organizationId
   * @param {string} props.targetProfileId
   * @param {string} props.description
   * @param {Array<import('./CampaignCompetence.js').CampaignCompetence>} props.competences
   */
  constructor({ competences, ...campaignOverviewProps }) {
    super(campaignOverviewProps);
    this.competences = competences;
  }
}
