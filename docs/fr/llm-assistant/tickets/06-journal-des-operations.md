Status: ready-for-agent

# 06: Journal des opérations faites par un outil

**What to build:** Toute opération d'écriture passée par un outil laisse une
trace : qui l'a faite, par quel moyen, et dans quel lot. Un auditeur doit pouvoir
retrouver l'ensemble des opérations issues d'un même lot, afin de défaire une
erreur systématique sans rapprocher un fichier à la main.

**Ce ticket est la contrepartie de tout ce qui est reporté.** Les garde-fous
d'interface — le bouton d'assentiment, l'affichage de la recevabilité — arrivent à
l'itération suivante. Tant qu'ils n'existent pas, un outil peut produire des
attachements valides mais non désirés. Deux choses rendent ce risque acceptable :
l'opération est réversible par détachement, et le journal dit quoi défaire. La
réversibilité est acquise ; le journal est ce ticket.

Il est écrit **au fil de l'exécution**, jamais à la fin : un lot interrompu doit
rester diagnosticable.

Le journal vit dans le contexte borné de l'assistant. Pix Audit Logs n'est pas
retenu : son modèle est centré sur des actions visant des personnes, et son objet
est le suivi RGPD.

**Blocked by:** 05

- [ ] Une entrée porte l'utilisateur, le moyen d'obtention et un identifiant de lot
- [ ] **Qui émet l'identifiant de lot est décidé et documenté.** La notion de lot
      appartient à l'itération Pix Admin ; dans le MVP, un identifiant fourni par
      l'appelant peut être forgé, scindé ou omis. Soit le serveur l'émet à
      l'ouverture de session, soit le comportement en son absence est défini.
- [ ] **Les écritures venant de Pix Admin sont journalisées elles aussi**, avec
      leur propre moyen d'obtention. Sans cela, l'absence d'entrée ne prouve rien
      et la distinction outil / Pix Admin n'est pas obtenue.
- [ ] Les entrées sont écrites au fil de l'exécution, pas à la fin
- [ ] Une exécution interrompue en cours laisse les entrées des opérations déjà
      effectuées
- [ ] Un essai à blanc n'écrit aucune entrée
- [ ] On peut retrouver toutes les opérations d'un même lot
- [ ] Le journal vit dans le contexte borné de l'assistant
