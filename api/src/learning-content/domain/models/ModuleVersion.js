export class ModuleVersion {
  constructor({ version }) {
    const [majorVersion, minorVersion] = version.split('.').map((version) => parseInt(version));
    this.majorVersion = majorVersion;
    this.minorVersion = minorVersion;
  }

  isGreaterThan(version) {
    if (!(version instanceof ModuleVersion)) {
      version = new ModuleVersion({ version });
    }

    if (this.majorVersion > version.majorVersion) {
      return true;
    }

    return this.majorVersion === version.majorVersion && this.minorVersion > version.minorVersion;
  }
}
