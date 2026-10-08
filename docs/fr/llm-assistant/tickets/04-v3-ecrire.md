Status: ready-for-agent

# 04: V3 — écrire

**What to build:** Depuis la conversation, l'utilisateur de test attache ou
détache un profil cible à une organisation, une opération à la fois. L'assistant
propose, l'essai à blanc montre ce qui changerait, l'utilisateur confirme, puis
l'écriture a lieu.

Cette verticale met à l'épreuve la boucle elle-même : essai à blanc, relecture,
confirmation. Est-elle comprise sans explication ?

**Aucun cas d'usage d'écriture nouveau n'est à écrire.** Les deux usecases
existent. Ce ticket les expose et fixe leur contrat.

**Blocked by:** 03

- [ ] Deux outils typés exposent l'attachement et le détachement
- [ ] Le paramètre de mode est explicite, et son absence vaut essai à blanc.
      L'écriture réelle ne peut pas résulter d'un oubli. Le POC faisait l'inverse :
      le mode destructeur s'obtenait en retirant un drapeau.
- [ ] L'appelant fixe le mode, jamais le modèle. La page hôte impose l'essai à
      blanc tant que l'utilisateur n'a pas confirmé.
- [ ] Le déclenchement de l'écriture vient d'un geste de l'utilisateur. Un appel
      d'outil ne peut pas le produire.
- [ ] Un essai à blanc ne modifie rien et rend ce qui changerait
- [ ] Un essai à blanc et une opération réelle refusent exactement les mêmes cas
- [ ] Ce qui est présenté à l'utilisateur désigne le profil sans ambiguïté :
      identifiant et nom complet, jamais un décompte seul
- [ ] Une erreur nomme les identifiants reçus qui n'existent pas. Pas de
      correspondance approchante : les écritures prennent des identifiants
      techniques.
- [ ] Les trois rôles du périmètre admin peuvent appeler ces outils. Un rôle hors
      périmètre est refusé — test du refus.
- [ ] Les usecases sont testés en intégration, base réelle et fixtures
- [ ] Les outils portent leurs annotations, l'écriture étant déclarée
      explicitement

**L'asymétrie des deux usecases est à traiter.** L'attachement prend une
organisation et N profils cibles : un appel suffit. Le détachement est écrit dans
l'autre sens, N organisations pour un profil cible. Détacher N profils d'une
organisation impose donc N appels. L'atomicité de cette boucle se décide ici :
transaction unique, ou boucle assumée dont la trace partielle est visible.

Le détachement est aussi le seul moyen de défaire une erreur, le journal étant
reporté. Il n'est pas une opération parmi d'autres.
