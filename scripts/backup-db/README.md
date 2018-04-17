Scripts de gestion de Backup de la BDD
======================================

Il y a 3 scripts dans ce dossier:

1. **open-tunnel.sh**: Ouvre un tunnel vers la BDD de l'app `pix-api`
2. **download-backup.sh**: À partir du tunnel ouvert, télécharge un backup de la BDD
3. **restore-backup.sh**: À partir du tunnel ouvert, restore un backup sur la BDD

## Prérequis

- La cli scalingo. Installer avec `curl -O https://cli-dl.scalingo.io/install && bash install`
- Le tooling postgresql. Installer le package `postgresql` de votre distribution.

## Usage

### download-backup.sh

**Objectif**: Avoir une backup de la BDD en local.

**Procédure**:

1. Lancer dans un nouveau shell à part le script `open-tunnel.sh`
2. Dans un nouveau shell, se déplacer dans le dossier de destination de la backup
3. Lancer le script `download-backup.sh` et attendre sa complétion
4. Quitter le script `open-tunnel.sh`

### restore-backup.sh

**Objectif**: Restaurer une backup depuis un fichier local vers une BDD distante.

**Procédure**:

1. Lancer dans un nouveau shell à part le script `open-tunnel.sh`
2. Dans un nouveau shell, lancer le script `restore-backup.sh $CHEMIN_LOCAL_DE_LA_BACKUP`
3. Attendre la complétion de (3) puis quitter le script `open-tunnel.sh`
