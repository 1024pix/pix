Status: ready-for-agent

# 03: Schéma `profils-cibles://`

**What to build:** Un second schéma, qui permet de lire un profil cible précis et
d'en chercher avec pagination.

**Ce ticket teste la conception autant qu'il livre une fonctionnalité.** Ajouter un
schéma doit se réduire à une entrée de registre : si la logique de résolution du
routeur doit changer, la promesse du ticket 02 est fausse et c'est la conception
qu'il faut reprendre.

Deux contraintes viennent du volume : il y a environ **1500 profils cibles**, aux
noms souvent voisins. Aucune lecture ne peut donc énumérer l'ensemble, et le risque
d'erreur dominant n'est pas l'opération illicite mais l'opération **structurellement
valide sur le mauvais profil** — que rien, en aval, ne rattrapera.

**Le tri par proximité est du travail réel, pas un paramètre.** La recherche
existante filtre par correspondance partielle sur `internalName`, puis trie par
obsolescence et par nom. Il n'y a aucune notion de proximité. L'obtenir suppose
soit une extension de recherche floue côté base, soit un classement applicatif sur
un ensemble déjà restreint. **Si l'extension n'est pas déjà disponible, sortir le
tri par proximité en ticket distinct plutôt que de l'embarquer ici.**

Le champ interrogé s'appelle `internalName` et n'est pas un libellé public :
l'adresse doit nommer le champ qu'elle interroge, faute de quoi l'appelant et
l'utilisateur ne parlent pas du même attribut.

**Blocked by:** 02

- [ ] `profils-cibles://<id>` rend un profil cible
- [ ] Une adresse de collection rend une page de résultats, accompagnée du
      décompte total
- [ ] Le champ interrogé est nommé explicitement dans l'adresse et dans la
      description de l'outil
- [ ] Une collection demandée sans plage est paginée par défaut : l'énumération
      complète est structurellement impossible
- [ ] Chaque résultat désigne le profil **sans ambiguïté** : identifiant, nom
      complet, état d'obsolescence
- [ ] La logique de résolution du routeur n'est pas modifiée ; le schéma s'ajoute
      par une seule entrée de registre. Aucun outil n'est ajouté ni modifié.
- [ ] Le tri par proximité est soit livré avec son mécanisme nommé, soit sorti en
      ticket distinct — décidé au début, pas découvert à la fin
