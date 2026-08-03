import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(calibrationReport) {
  return new Serializer('calibration-reports', {
    attributes: ['calibrationId', 'generatedAt', 'reportLines'],
    transform: (calibrationReport) => {
      return {
        id: `${calibrationReport.versionId}_${calibrationReport.calibrationId}`,
        generatedAt: calibrationReport.generatedAt,
        calibrationId: calibrationReport.calibrationId,
        reportLines: calibrationReport.reportLines,
      };
    },
  }).serialize(calibrationReport);
}
