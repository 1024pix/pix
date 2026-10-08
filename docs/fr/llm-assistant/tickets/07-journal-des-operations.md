Status: needs-triage

# 07: Journal des opérations faites par un outil

**Reporté.** Hors du périmètre du premier jalon. Exigible **dès le deuxième
utilisateur**, ou dès que l'usage n'est plus accompagné. Conservé ici pour ne pas
être redécouvert.

**What to build:** Toute opération d'écriture passée par un outil laisse une
trace : qui l'a faite, par quel moyen, et dans quel lot. Un auditeur retrouve
l'ensemble des opérations d'un même lot, et défait une erreur systématique sans
rapprocher un fichier à la main.

**Pourquoi c'est reporté.** À l'échelle d'un utilisateur de test unique et
accompagné, trois choses remplacent le journal : l'opération se défait par un
détachement, le fichier de règles est lui-même l'enregistrement et le rejouer en
mode détachement annule le lot, et la conversation garde le fil.

**Pourquoi ça cesse de tenir.** Ces trois substituts supposent une personne qui se
souvient de ce qu'elle a fait, et un fichier qu'elle a encore. Au deuxième
utilisateur, plus personne ne peut dire qui a attaché quoi.

**Blocked by:** None

- [ ] Une entrée porte l'utilisateur, le moyen d'obtention et un identifiant de lot
- [ ] Qui émet l'identifiant de lot est décidé et documenté. La notion de lot vit
      côté client : un identifiant fourni par l'appelant peut être forgé, scindé ou
      omis.
- [ ] Les écritures venant de Pix Admin sont journalisées elles aussi, avec leur
      propre moyen d'obtention. Sans cela, l'absence d'entrée ne prouve rien et la
      distinction outil ou Pix Admin n'est pas obtenue.
- [ ] Les entrées sont écrites au fil de l'exécution, pas à la fin
- [ ] Une exécution interrompue laisse les entrées des opérations déjà effectuées
- [ ] Un essai à blanc n'écrit aucune entrée
- [ ] On retrouve toutes les opérations d'un même lot
- [ ] Le journal vit dans le contexte borné de l'assistant

Pix Audit Logs n'est pas retenu : son modèle est centré sur des actions visant des
personnes, et son objet est le suivi RGPD. L'identité de l'auteur reste par
ailleurs portée par le champ existant du modèle d'organisation.
