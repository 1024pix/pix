import { CampaignOverviewDTO } from './CampaignOverviewDTO.js';

export class CampaignCompetenceDTO {
  /**
   * @param {Object} props
   * @param {string} props.id
   * @param {string} props.index
   * @param {string} props.name
   * @param {number} props.maxLevel
   */
  constructor({ id, index, name, maxLevel }) {
    this.id = id;
    this.index = index;
    this.name = name;
    this.maxLevel = maxLevel;
  }
}

export class CampaignOverviewWithCompetencesDTO extends CampaignOverviewDTO {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {string} props.code
   * @param {string} props.name
   * @param {string} props.type
   * @param {string} props.organizationName
   * @param {string} props.organizationId
   * @param {string} props.description
   * @param {Array<{ id: string, index: string, name: string, maxLevel: number }>} props.competences
   */
  constructor({ competences, ...campaignOverviewProps }) {
    super(campaignOverviewProps);
    this.competences = competences.map((competence) => new CampaignCompetenceDTO(competence));
  }
}
