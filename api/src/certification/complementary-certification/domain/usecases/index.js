import { attachBadges } from './attach-badges.js';
import { getById } from './get-by-id.js';
import { getByLabel } from './get-by-label.js';
import { getComplementaryCertificationForTargetProfileAttachmentRepository } from './get-complementary-certification-for-target-profile-attachment.js';
import { getComplementaryCertificationTargetProfileHistory } from './get-complementary-certification-target-profile-history.js';
import { sendTargetProfileNotifications } from './send-target-profile-notifications.js';

const usecases = {
  attachBadges,
  getById,
  getByLabel,
  getComplementaryCertificationForTargetProfileAttachmentRepository,
  getComplementaryCertificationTargetProfileHistory,
  sendTargetProfileNotifications,
};

export { usecases };
