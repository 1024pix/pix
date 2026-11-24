import { AnonymizeCertificationCenterMembershipEventHandler } from './application/certification-center-membership/anonymize-certification-center-membership.event-handler.js';
import { AnonymizeMembershipEventHandler } from './application/membership/anonymize-membership.event-handler.js';

export const teamJobControllers = [AnonymizeCertificationCenterMembershipEventHandler, AnonymizeMembershipEventHandler];
