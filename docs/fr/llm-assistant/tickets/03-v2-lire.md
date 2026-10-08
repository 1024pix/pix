Status: ready-for-agent

# 03: V2 — lire

**What to build:** L'utilisateur de test demande à l'assistant ce qui est attaché
à une organisation, ou cherche un profil cible par son nom. L'assistant répond en
se servant d'outils. Aucune écriture.

Cette verticale met à l'épreuve le risque dominant du chantier : il existe environ
1500 profils cibles, aux noms souvent voisins. L'erreur probable n'est pas une
opération interdite, c'est une opération juste sur le mauvais profil. Rien en aval
ne la rattrape. C'est ici qu'on mesure si la résolution tient.

**Les lectures sont génériques, les écritures seront spécifiques.** Une écriture a
besoin d'un schéma typé pour pouvoir refuser. Une lecture n'a besoin que d'une
adresse. Couvrir une entité de plus doit ajouter un schéma, jamais un outil : le
catalogue reste fermé à trois entrées quel que soit le périmètre couvert.

**Blocked by:** 02

- [ ] Un serveur MCP relaie l'identité de l'appelant. Aucun secret ni compte de
      service ne lui est propre.
- [ ] Un outil unique, `read`, prend une adresse et rend la ressource
      correspondante
- [ ] `organisations://<id>` rend la fiche de l'organisation avec ses profils
      cibles attachés
- [ ] La liste des profils attachés rendue dans la fiche est plafonnée et paginée,
      avec son décompte total. Sans cela, l'énumération interdite à la collection
      rentre par la fiche.
- [ ] `profils-cibles://<id>` rend un profil, et une adresse de collection rend une
      page de résultats avec le décompte total
- [ ] Une collection demandée sans plage est paginée par défaut. L'énumération
      complète est impossible.
- [ ] La correspondance est exacte. Le tri par proximité est hors périmètre.
- [ ] Chaque résultat désigne le profil sans ambiguïté : identifiant, nom complet,
      état d'obsolescence
- [ ] Le champ interrogé est nommé explicitement dans l'adresse et dans la
      description de l'outil. Il s'appelle `internalName` et n'est pas un libellé
      public.
- [ ] Une adresse invalide répond par la liste des schémas disponibles et un
      exemple d'adresse valide
- [ ] Ajouter le second schéma ne modifie ni `read`, ni la logique de résolution du
      routeur. Le schéma s'ajoute par une entrée de registre.
- [ ] Le registre de sessions est derrière une abstraction remplaçable. Une
      implémentation en mémoire est acceptée : le MVP tourne dans un seul
      conteneur.
- [ ] Un appel portant un rôle hors du périmètre admin est refusé — test du refus
