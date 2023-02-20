function certificationCpfCountryBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCpfCountry({
    code: '99401',
    commonName: 'CANADA',
    originalName: 'CANADA',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    code: '99100',
    commonName: 'FRANCE',
    originalName: 'FRANCE',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    code: '99345',
    commonName: 'TOGO',
    originalName: 'TOGO',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    code: '99243',
    commonName: 'VIET NAM',
    originalName: 'VIET NAM',
  });

  databaseBuilder.factory.buildCertificationCpfCountry({
    code: '99425',
    commonName: 'TURKS ET CAIQUES (ILES)',
    originalName: 'TURKS ET CAÏQUES (ÎLES)',
  });
}

export default { certificationCpfCountryBuilder };
