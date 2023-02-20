export default function findCountries({ countryRepository }) {
  return countryRepository.findAll();
}
