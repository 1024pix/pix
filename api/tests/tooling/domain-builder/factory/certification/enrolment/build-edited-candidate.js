import { EditedCandidate } from '../../../../../../src/certification/enrolment/domain/models/EditedCandidate.js';

const buildEditedCandidate = function ({ id = 123, accessibilityAdjustmentNeeded = false } = {}) {
  return new EditedCandidate({
    id,
    accessibilityAdjustmentNeeded,
  });
};

export { buildEditedCandidate };
