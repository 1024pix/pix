
import ProgressWithCheckpoint from './ProgressWithCheckpoints';
import ProgressWithoutCheckpoint from './ProgressWithoutCheckpoints';

export function getProgressionBehaviorFromAssessmentType(assessmentType) {
  switch (assessmentType) {
    case 'SMART_PLACEMENT':
      return ProgressWithCheckpoint;
    default:
      return ProgressWithoutCheckpoint;
  }
}
