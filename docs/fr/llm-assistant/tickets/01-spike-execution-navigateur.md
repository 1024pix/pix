Status: ready-for-agent

# 01: Spike — exécuter du code généré dans le navigateur

**What to build:** Une investigation bornée dans le temps, qui répond à une seule
question : peut-on exécuter du code généré côté client, et à quel prix pour la
politique de sécurité de contenu ? Le code produit est jeté.

Ce spike est un go/no-go sur la verticale V4, pas un détail d'implémentation.
Sans exécution côté client, il reste l'exécution serveur, écartée parce que
`vm.runInContext` n'est pas un bac à sable, ou la correspondance déclarative
colonne vers champ, écartée parce qu'elle supprime l'adaptation à des formats de
fichier imprévus. Les deux sont des décisions fermées qu'il faudrait rouvrir.

**Ce qui est déjà établi**, et qu'il ne faut pas réinvestiguer. La politique
servie par Pix Admin ne déclare ni `worker-src`, ni `child-src`, ni `default-src`.
Les workers retombent donc sur `script-src 'self' …`. Un worker chargé depuis un
fichier statique de l'origine passe ; un worker construit depuis un `blob:` est
refusé ; `new Function` dans le worker est refusé. Les deux montages demandent une
modification de la politique.

**Le banc d'essai est une review app.** Le middleware de dev-serveur du dépôt ne
simule qu'une copie de la politique, qui a dérivé de la politique réelle : il lui
manque le hash `sha256` et le `report-uri`. Il sert à écarter vite un montage qui
échoue déjà en local. Il ne conclut rien sur la production.

**La politique d'une review app se modifie sans accord de l'équipe sécurité.**
Seule la production demande le leur. Ce ticket n'attend donc personne. La demande
pour la production vient après, et elle apporte les résultats d'ici plutôt qu'une
hypothèse.

**Blocked by:** None (can start immediately)

- [ ] L'équipe qui tient la politique est prévenue avant les essais, par courtoisie
      et non pour autorisation : les violations remonteront chez elle par
      `report-uri https://csp-report.pix.fr`, qui est aussi déclaré sur les review
      apps
- [ ] Les deux montages sont essayés sur une review app, sur Chrome et sur Firefox
- [ ] Réponse à « la politique de production se modifie-t-elle par chemin, ou
      seulement globalement ? ». Si elle ne se modifie que globalement, l'option A
      devient une demande d'`'unsafe-eval'` sur toute l'application, ce qui change
      son arbitrage.
- [ ] Une recommandation d'une ligne, portée dans la spec
- [ ] Le code est jeté et la branche fermée sans fusion

La position de l'équipe sécurité sur `'unsafe-eval'` et sur
`worker-src 'self' blob:` ne fait pas partie de ce ticket. Elle se demande ensuite,
pour la production, avec la note de décision et les résultats du spike.

**Ce qu'il ne faut pas faire** : servir le script généré depuis l'origine de Pix
Admin pour contourner la politique. Cela fabrique une primitive de script stocké,
chargeable dans tout contexte de cette origine, et non plus seulement dans le
worker.
