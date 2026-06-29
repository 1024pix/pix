import {
  FRAMEWORK_HISTORY_STATUSES,
  FrameworkHistoryEntry,
} from '../../../../../../src/certification/configuration/domain/read-models/FrameworkHistoryEntry.js';

export const buildFrameworkHistoryEntry = ({
  id = 1,
  startDate = new Date('2024-01-01'),
  expirationDate = null,
  assessmentDuration = 90,
  maximumAssessmentLength = 32,
  status = FRAMEWORK_HISTORY_STATUSES.DRAFT,
} = {}) => {
  return new FrameworkHistoryEntry({
    id,
    startDate,
    expirationDate,
    assessmentDuration,
    maximumAssessmentLength,
    status,
  });
};
