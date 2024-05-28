export const CERTIFICATION_VERSIONS = {
  V1: 1,
  V2: 2,
  V3: 3,
};

export class CertificationVersion {
  static isV3(version) {
    return version === CERTIFICATION_VERSIONS.V3;
  }

  static isV1(version) {
    return version === CERTIFICATION_VERSIONS.V1;
  }
}
