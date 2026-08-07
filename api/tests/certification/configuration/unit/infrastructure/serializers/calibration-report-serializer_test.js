import { expect } from 'chai';

import {
  CalibrationReport,
  CalibrationReportLine,
} from '../../../../../../src/certification/configuration/domain/models/CalibrationReport.js';
import * as serializer from '../../../../../../src/certification/configuration/infrastructure/serializers/calibration-report-serializer.js';

describe('Certification | Configuration | Unit | Infrastructure | Serializer | calibration report', function () {
  describe('#serialize', function () {
    it('should serialize a calibration report to JSONAPI format', function () {
      const calibrationReport = new CalibrationReport({
        versionId: 1,
        calibrationId: 2,
        generatedAt: new Date('2021-02-02'),
        reportLines: [
          new CalibrationReportLine({
            content: 'abc',
            alertLevel: 'boubou',
            additionalContent: null,
            label: 'label1',
          }),
          new CalibrationReportLine({
            content: 'def',
            alertLevel: null,
            additionalContent: 'salut',
            label: 'label2',
          }),
        ],
      });

      const result = serializer.serialize(calibrationReport);

      expect(result).to.deep.equal({
        data: {
          type: 'calibration-reports',
          id: '1_2',
          attributes: {
            'calibration-id': 2,
            'generated-at': new Date('2021-02-02'),
            'report-lines': [
              {
                additionalContent: null,
                alertLevel: 'boubou',
                content: 'abc',
                label: 'label1',
              },
              {
                additionalContent: 'salut',
                alertLevel: null,
                content: 'def',
                label: 'label2',
              },
            ],
          },
        },
      });
    });
  });
});
