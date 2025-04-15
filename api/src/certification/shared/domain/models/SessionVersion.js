export const SESSIONS_VERSIONS = {
  V1: 1,
  V2: 2,
  V3: 3,
};

export class SessionVersion {
  static isV3(version) {
    return version === SESSIONS_VERSIONS.V3;
  }
}
