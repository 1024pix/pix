/**
 * Version of the certification algorithm used for candidate evaluation
 * It applies to various things, but especially :
 *   - how are selected the challenges during a certification
 *   - how will be scored the certification
 * @readonly
 * @enum {number}
 */
export class AlgorithmEngineVersion {
  static V1 = 1;
  static V2 = 2;
  static V3 = 3;

  static isV1(version) {
    return version === AlgorithmEngineVersion.V1;
  }

  static isV2(version) {
    return version === AlgorithmEngineVersion.V2;
  }

  static isV3(version) {
    return version === AlgorithmEngineVersion.V3;
  }
}
