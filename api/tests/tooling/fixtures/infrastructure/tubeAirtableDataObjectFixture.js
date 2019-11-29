module.exports = function TubeAirtableDataObjectFixture({
  id = 'recTIddrkopID23Fp',
  name = '@Moteur',
  title = 'Moteur de recherche',
  description = 'Connaître le fonctionnement d\'un moteur de recherche',
  practicalTitle = 'Outils d\'accès au web',
  practicalDescription = 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche',
} = {}) {
  return {
    id,
    name,
    title,
    description,
    practicalTitle,
    practicalDescription,
  };
};
