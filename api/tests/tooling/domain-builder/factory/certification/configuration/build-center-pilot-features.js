import { CenterPilotFeatures } from '../../../../../../src/certification/configuration/domain/models/CenterPilotFeatures.js';

const buildCenterPilotFeatures = function ({ centerId, isComplementaryAlonePilot }) {
  return new CenterPilotFeatures({
    centerId,
    isComplementaryAlonePilot,
  });
};

buildCenterPilotFeatures.v2 = function ({ centerId }) {
  return new CenterPilotFeatures({
    centerId,
    isComplementaryAlonePilot: false,
  });
};

buildCenterPilotFeatures.v3 = function ({ centerId, isComplementaryAlonePilot = true }) {
  return new CenterPilotFeatures({ centerId, isComplementaryAlonePilot });
};

export { buildCenterPilotFeatures };
