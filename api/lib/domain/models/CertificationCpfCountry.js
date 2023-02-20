class CertificationCpfCountry {
  constructor({ id, code, commonName, originalName, matcher } = {}) {
    this.id = id;
    this.code = code;
    this.commonName = commonName;
    this.originalName = originalName;
    this.matcher = matcher;
  }

  isFrance() {
    return this.code === '99100';
  }

  isForeign() {
    return this.code !== '99100';
  }
}

export default CertificationCpfCountry;
