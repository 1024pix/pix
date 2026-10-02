Status: ready-for-agent

# 05: Attacher et détacher des profils cibles, essai à blanc par défaut

**What to build:** Deux outils d'écriture typés — attacher N profils cibles à une
organisation, en détacher N — adossés aux usecases existants.

Le mode est **explicite, et son absence vaut essai à blanc**. L'écriture réelle ne
peut jamais résulter d'un oubli. Le POC faisait l'inverse : le mode destructeur
s'obtenait en *retirant* un drapeau, et c'est la correction obligatoire de son
contrat.

L'essai à blanc applique **exactement les mêmes règles** que l'opération réelle.
C'est ce qui lui donne sa valeur : il devient un essai des vrais refus. Ce critère
n'est falsifiable qu'une fois le ticket 01 livré — avant, rien ne refuse et le test
passe trivialement. D'où le blocage par 01.

**Asymétrie des deux usecases, à traiter.** L'attachement prend une organisation et
N profils cibles : un appel suffit. Le détachement est écrit dans l'autre sens — N
organisations pour **un** profil cible — donc détacher N profils d'une organisation
impose N appels. L'atomicité de cette boucle doit être décidée ici : transaction
unique, ou boucle assumée dont le journal garde la trace partielle.

**Blocked by:** 01, 02

- [ ] Attacher N profils cibles à une organisation
- [ ] Détacher N profils cibles d'une organisation, avec un comportement d'atomicité
      explicitement choisi et documenté
- [ ] Le paramètre de mode est explicite ; son absence vaut essai à blanc
- [ ] Un essai à blanc ne modifie rien et rend ce qui changerait
- [ ] Un essai à blanc et une opération réelle refusent **exactement** les mêmes
      cas — vérifié à la couture usecase
- [ ] Une erreur nomme les identifiants reçus qui n'existent pas. Pas de
      correspondance approchante ici : les écritures prennent des identifiants
      techniques, la proximité relève de la recherche.
- [ ] Les trois rôles du périmètre admin peuvent appeler ces outils ; un rôle hors
      périmètre est refusé — test du **refus**
- [ ] Les usecases sont testés en intégration, base réelle et fixtures
- [ ] Les outils portent leurs annotations, écriture déclarée explicitement
