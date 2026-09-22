Status: ready-for-agent

# 01: Amorce — serveur MCP du backoffice

**What to build:** Un serveur MCP joignable depuis l'API de Pix, qui relaie
l'identité de l'appelant et expose un outil de vérification. Une personne
authentifiée sur le périmètre admin peut l'invoquer et en recevoir le résultat ;
une personne sans jeton valide, ou portant un rôle hors périmètre, est refusée.

C'est le fil conducteur du chantier : une tranche étroite mais complète, du
contexte borné jusqu'au transport MCP. Son consommateur final — l'assistant dans
Pix Admin — n'existe pas encore, et c'est normal : il appartient à l'itération
suivante. Ce ticket se vérifie par ses tests et par un essai manuel en
développement avec un jeton obtenu localement.

**L'outil exposé est temporaire et nommé comme tel** : il rend l'identité de
l'appelant et rien d'autre, et il est **supprimé par le ticket 02** quand `read`
arrive. Le catalogue définitif est fermé à trois entrées — `read`, attacher,
détacher — et cette amorce ne doit pas en consommer une.

Le serveur n'a **pas d'authentification propre** : il relaie le jeton de
l'appelant. Aucun secret ni compte de service ne doit être introduit ici. Un
modèle d'authentification autonome sera nécessaire le jour d'une ouverture aux
partenaires ; ce n'est pas l'objet de ce ticket.

**Le nom du contexte borné à créer est à trancher au début du ticket** : `mcp-admin-server`
est déjà pris par la branche du POC, déclarée jetable. Choisir, et dire ce
qu'il advient de l'ancien.

**Blocked by:** None (can start immediately)

- [ ] Un contexte borné dédié existe, nommé explicitement, avec ses routes
      déclarées, et ne dépend d'aucun code du POC
- [ ] Le serveur MCP expose un outil temporaire de vérification d'identité,
      correctement listé par le protocole, et signalé comme jetable
- [ ] L'outil porte ses annotations, y compris la distinction lecture / écriture —
      elle ne doit jamais résulter d'une valeur par défaut implicite
- [ ] L'identité de l'appelant est relayée jusqu'à l'API
- [ ] Un appel sans jeton est refusé
- [ ] Un appel portant un rôle hors du périmètre admin est refusé — test
      d'acceptance sur le **refus**, pas seulement sur le cas passant
- [ ] Le registre de sessions est **derrière une abstraction remplaçable**. Une
      implémentation en mémoire est acceptée : le MVP tourne dans un seul
      conteneur, et le multi-conteneurs est explicitement reporté à l'ouverture
      partenaires. Ce qui compte est de ne pas répandre l'hypothèse « un seul
      processus » dans le reste du code.
- [ ] Les journaux permettent de suivre un appel d'outil : nom, durée, issue
