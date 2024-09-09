import { CenterPilotFeatures } from '../../../../../../src/certification/configuration/domain/models/CenterPilotFeatures.js';

const buildCenterPilotFeatures = function ({ centerId, isV3Pilot, isComplementaryAlonePilot }) {
  return new CenterPilotFeatures({
    centerId,
    isV3Pilot,
    isComplementaryAlonePilot,
  });
};

buildCenterPilotFeatures.v2 = function ({ centerId }) {
  return new CenterPilotFeatures({
    centerId,
    isV3Pilot: false,
    isComplementaryAlonePilot: false,
  });
};

buildCenterPilotFeatures.v3 = function ({ centerId, isComplementaryAlonePilot = true }) {
  return new CenterPilotFeatures({ centerId, isV3Pilot: true, isComplementaryAlonePilot });
};

export { buildCenterPilotFeatures };
