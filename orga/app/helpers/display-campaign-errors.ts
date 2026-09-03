import Helper from '@ember/component/helper';
import { service } from '@ember/service';

interface CampaignError {
  message: string;
}

// Minimal typing of the still-JS error-messages service.
interface ErrorMessagesService {
  getErrorMessage(code: string, meta?: Record<string, unknown>): string | undefined;
}

interface DisplayCampaignErrorsSignature {
  Args: {
    Positional: [errors: CampaignError[]];
  };
  Return: string | null;
}

export default class DisplayCampaignErrors extends Helper<DisplayCampaignErrorsSignature> {
  @service declare errorMessages: ErrorMessagesService;

  compute([errors]: [CampaignError[]]): string | null {
    const [firstError] = errors;
    if (!firstError) return null;
    return this.errorMessages.getErrorMessage(firstError.message) ?? null;
  }
}
