import type { CheckableItem } from '../value-objects/CriterionProperty.ts';

type EligibilityPassageInput = {
  status: CheckableItem[string];
  referenceId: CheckableItem[string];
  isTerminated: CheckableItem[string];
};

type EligibilityPassage = {
  status: CheckableItem[string];
  moduleId: CheckableItem[string];
  isTerminated: CheckableItem[string];
};

export type EligibilityArgs = {
  organizationLearner?: CheckableItem;
  organization?: CheckableItem;
  campaignParticipations?: CheckableItem[];
  passages?: EligibilityPassageInput[];
};

export class Eligibility {
  organizationLearner: CheckableItem;
  organization: CheckableItem | undefined;
  campaignParticipations: CheckableItem[];
  passages: EligibilityPassage[];

  constructor({ organizationLearner, organization, campaignParticipations = [], passages = [] }: EligibilityArgs) {
    this.organizationLearner = {
      id: organizationLearner?.id,
    };
    this.organization = organization;
    this.campaignParticipations = campaignParticipations;
    this.passages = passages.map((passage) => ({
      status: passage.status,
      moduleId: passage.referenceId,
      isTerminated: passage.isTerminated,
    }));
  }

  hasCampaignParticipation(campaignParticipationId: number): boolean {
    return this.campaignParticipations.some(
      (campaignParticipation) => campaignParticipation.id === campaignParticipationId,
    );
  }

  buildEligibilityScopedByCampaignParticipationId({
    campaignParticipationId,
  }: {
    campaignParticipationId: number;
  }): Eligibility {
    return new Eligibility({
      organizationLearner: this.organizationLearner,
      organization: this.organization,
      campaignParticipations: this.campaignParticipations.filter((cp) => cp.id === campaignParticipationId),
    });
  }
}
