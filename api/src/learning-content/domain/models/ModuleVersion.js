export class ModuleVersion {
  constructor({ version }) {
    const [majorVersion, minorVersion] = version.split('.').map((version) => parseInt(version));
    this.majorVersion = majorVersion;
    this.minorVersion = minorVersion;
  }

  isGreaterThan(version) {
    const otherVersion = version instanceof ModuleVersion ? version : new ModuleVersion({ version });

    if (this.majorVersion > otherVersion.majorVersion) {
      return true;
    }

    return this.majorVersion === otherVersion.majorVersion && this.minorVersion > otherVersion.minorVersion;
  }
}
