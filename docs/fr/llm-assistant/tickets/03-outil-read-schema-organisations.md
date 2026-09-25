Status: ready-for-agent

# 03: Outil `read` — routeur de schémas et `organisations://`

**What to build:** Un outil **unique** de lecture, `read`, qui prend une adresse et
rend la ressource correspondante. Premier schéma : une organisation désignée par
son identifiant technique, rendue avec ses profils cibles attachés.

L'enjeu n'est pas la fiche, c'est la forme. Les lectures sont **génériques** et
adressées par schéma, là où les écritures restent **spécifiques** et typées : une
écriture a besoin d'un schéma typé pour pouvoir refuser, une lecture n'a besoin que
d'une adresse. Couvrir une entité de plus devra ajouter un schéma, jamais un outil.

Une adresse est du texte libre là où un schéma typé guide l'appelant. La grammaire
reste donc délibérément pauvre — un schéma, un identifiant ou un filtre, une plage
— et une adresse invalide doit se rattraper d'elle-même en répondant par les
schémas disponibles et un exemple.

**Blocked by:** 02

- [ ] `read` accepte une adresse, avec un sélecteur de plage terminal optionnel
- [ ] `organisations://<id>` rend la fiche de l'organisation, profils cibles
      attachés compris
- [ ] La fiche est un read-model : assemblée pour un consommateur, sans être une
      entité du domaine, et testée unitairement sur la forme produite
- [ ] Un identifiant inconnu répond par une erreur nommant la valeur reçue
- [ ] Une adresse mal formée, ou portant un schéma inconnu, répond par la liste des
      schémas disponibles et un exemple d'adresse valide
- [ ] **La liste des profils attachés rendue dans la fiche est plafonnée et
      paginée**, avec son décompte total. Sans cela l'énumération interdite à la
      collection rentrerait par la fiche.
- [ ] Aucun outil de lecture supplémentaire n'est ajouté au catalogue
- [ ] L'outil temporaire de vérification d'identité posé par le ticket 02 est
      **supprimé**
- [ ] La grammaire d'adressage est documentée dans la description de l'outil :
      délimiteur, forme du sélecteur de plage, échappement, et comportement par
      défaut en l'absence de plage. Elle est illustrée à l'identique dans le
      ticket 04.
