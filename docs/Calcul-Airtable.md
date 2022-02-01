# Calcul des Pix dans Airtable

# Règle de calcul des Pix

Rappel de la règle de calcul :

1.  On ne considère dans la suite que les Acquis :
    1.  Ayant le champ **Status** à **actif** ;
    2.  Associé à au moins une épreuve ayant le champ **Statut** à **validé**, **validé sans test** ou **pré-validé**.
    3.  Associé à une Compétence dont le champ **Origine** est **Pix**
2.  Pour chaque Acquis :
    1.  On compte le nombre d'acquis :
        1.  de la même compétence ;
        2.  et de même niveau.
    2.  On divise 8 par ce nombre pour obtenir la valeur en Pix ; si le résultat est supérieur à 4 la valeur est limitée à 4.

# Ajouter les champs de calcul des Pix

Rappel : la hiérarchie d'objets concernée est la suivante :

*   Chaque Compétence :
    *   contient des Tubes…
        *   qui contiennent des Acquis…
            *   qui contiennent des Epreuves.

L'idée est de construire en remontant la liste des niveaux des acquis jusqu'à leur compétence, puis de la redescendre jusqu'à chaque acquis qui peut ensuite déterminer combien d'acquis dans sa compétence ont le même niveau que lui.

Sont ajoutés les champs suivants, dans l'ordre où ils sont évalués :

*   **Epreuves**.**IsValidated** qui vaut 1 si l'épreuve est considérée "validée" (règle 1.b), et 0 sinon ;
    *   Field type : Formula
    *   Formule : <span style="color: rgb(0,146,29);">IF(OR({Statut}="validé", {Statut}="validé sans test", {Statut}="pré-validé"), 1,0)</span>
    *   Exemple de résultat : 1
*   **Acquis**.**LevelIfActive** qui vaut le niveau (**Level**) de l'acquis si le **Status** est **actif** (règle 1.a) et qu'il existe une épreuve validée (règle 1.b), sinon une chaîne vide ;
    *   Pour savoir s'il existe une épreuve validée, ce champ est un _rollup_ du champ **IsValidated** des épreuves associées à l'acquis ; en faisant la somme des **IsValidated** on sait s'il existe ou non une épreuve validée; 
    *   Field type : Rollup
    *   Formule : <span style="color: rgb(0,146,29);">IF(AND(SUM(values) > 0, Status="actif"), Level, "")</span>
    *   Exemple de résultat : 3
*   **Tubes**.**AcquisLevels** qui calcule la concaténation des **LevelIfActive** des **Acquis** contenus dans le tube ;
    *   Field type : Rollup 
    *   Formule : <span style="color: rgb(0,146,29);">CONCATENATE(values)</span>
    *   Exemple de résultat : 1245
*   **Acquis**.**Origin** qui recopie le champ **Origine** de la compétence sur chacun de ses Tubes ;
    *   Field type : Lookup
    *   Exemple de résultat : "Pix"
*   **Competences**.**AcquisLevels** qui fait à son tour la concaténation des **AcquisLevels** remontés sur les **Tubes** ;
    *   Field type : Rollup
    *   Formule : <span style="color: rgb(0,146,29);">CONCATENATE(values)</span>
    *   Exemple de résultat : 1544352134513675445363453124351241234
*   **Tubes**.**CompetenceAcquisLevels** qui recopie le champ **AcquisLevels** de la compétence sur chacun de ses Tubes ;
    *   Field type : Lookup 
    *   Exemple de résultat : 1544352134513675445363453124351241234
*   **Acquis**.**PixValue** qui récupère le **CompetenceAcquisLevels** de son Tube et dispose donc de la liste complète des niveaux d'acquis présents dans sa compétence, et l'utilise pour calculer sa valeur en Pix :
    *   Si l'acquis n'est pas actif au sens de la règle 1, sa valeur est simplement mise à zéro ; 
    *   Si l'acquis n'est pas d'origine Pix, sa valeur est simplement mise à zéro ; 
    *   Sinon, on doit déterminer dans la chaîne des niveaux le nombre d'occurrences du niveau de l'acquis considéré. Comme Airtable ne fournit pas de fonction donnant directement ce nombre, on calcule la différence entre la longueur de la chaîne originale (ex. 12434132), et cette même chaîne dans laquelle on aurait remplacé notre niveau (ex. 2) par une chaîne vide (ex. 143413), ce qui donne bien le nombre d'occurrences du niveau dans la compétence ;
    *   Il ne reste qu'à diviser 8 par ce nombre et limiter à 4 le résultat ;
    *   Field type : Rollup
    *   Formule : <span style="color: rgb(0,146,29);">IF(LevelIfActive > 0, MIN(4, 8/(LEN(CONCATENATE(values)) - LEN(SUBSTITUTE( CONCATENATE(values),LevelIfActive,"")))), 0)</span>
    *   Noter que même si à la base on a une simple copie d'une valeur de l'enregistrement **Tube** lié, ce qui correspond plutôt à un **lookup** on utilise ici un champ de type **rollup** pour pouvoir appliquer une formule. Du coup on est obligé de faire un **CONCATENATE(values)** pour obtenir la valeur de **CompetenceAcquisLevels** ;
    *   Il est utile de changer le formatage par défaut du champ pour afficher quelques décimales ;
    *   Exemple de résultat : 1.333

