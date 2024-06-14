import { Clea } from './complementary-data.js';

export const billingModeList = {
  FREE: 'FREE',
  PAID: 'PAID',
  PREPAID: 'PREPAID',
};

export const candidateLena = {
  firstName: 'Lena',
  lastName: 'Rine',
  birthCity: 'Paris',
  birthCountry: 'France',
  birthPostalCode: '75001',
  birthINSEECode: '75101',
  birthProvinceCode: '11',
  sex: 'F',
  email: 'lena.rine@example.com',
  birthdate: '1990-05-15',
  externalId: null,
  extraTimePercentage: null,
};
export const candidateLara = {
  firstName: 'Lara',
  lastName: 'Pafromage',
  birthCity: 'Lyon',
  birthCountry: 'France',
  birthPostalCode: '69002',
  birthINSEECode: '69382',
  birthProvinceCode: '84',
  sex: 'F',
  email: 'lara.pafromage@example.com',
  birthdate: '1985-08-23',
  externalId: null,
  extraTimePercentage: null,
};
export const candidateOtto = {
  firstName: 'Otto',
  lastName: 'Mate',
  birthCity: 'Marseille',
  birthCountry: 'France',
  birthPostalCode: '13001',
  birthINSEECode: '13055',
  birthProvinceCode: '93',
  sex: 'M',
  email: 'otto.mate@example.com',
  birthdate: '1988-11-30',
  externalId: null,
  extraTimePercentage: null,
};
export const candidatePat = {
  firstName: 'Pat',
  lastName: 'Atrak',
  birthCity: 'Nice',
  birthCountry: 'France',
  birthPostalCode: '06000',
  birthINSEECode: '06088',
  birthProvinceCode: '93',
  sex: 'M',
  email: 'pat.atrak@example.com',
  birthdate: '1992-04-17',
  externalId: null,
  extraTimePercentage: null,
};
export const candidateJean = {
  firstName: 'Jean',
  lastName: 'Registre',
  birthCity: 'Bordeaux',
  birthCountry: 'France',
  birthPostalCode: '33000',
  birthINSEECode: '33063',
  birthProvinceCode: '75',
  sex: 'M',
  email: 'jean.registre@example.com',
  birthdate: '1987-09-12',
  externalId: null,
  extraTimePercentage: null,
};
export const candidateEvy = {
  firstName: 'Evy',
  lastName: 'Damant',
  birthCity: 'Lille',
  birthCountry: 'France',
  birthPostalCode: '59000',
  birthINSEECode: '59350',
  birthProvinceCode: '32',
  sex: 'F',
  email: 'evy.damant@example.com',
  birthdate: '1995-02-08',
  externalId: null,
  extraTimePercentage: null,
};
export const candidateSarah = {
  firstName: 'Sarah',
  lastName: 'Joute',
  birthCity: 'Strasbourg',
  birthCountry: 'France',
  birthPostalCode: '67000',
  birthINSEECode: '67482',
  birthProvinceCode: '44',
  sex: 'F',
  email: 'sarah.joute@example.com',
  birthdate: '1993-11-21',
  externalId: null,
  extraTimePercentage: null,
};

export const lenaClea = {
  ...candidateLena,
  complementaryCertification: {
    ...Clea,
  },
};

export const laraBillingPrepaid = {
  ...candidateLara,
  billingMode: billingModeList.PREPAID,
  prepaymentCode: 'AB456',
};
