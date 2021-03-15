#!/usr/bin/sh
# Utilisation :
# sh ./extract-answers.sh ~/Downloads/20190513134501_pix_api_1412.pgsql "2019-04-11"

pgFile=$1
date=$2
database="postgresql://postgres:@localhost:5432/postgres"
day="$(echo ${date} | cut -d' ' -f1)"
extractAnswersReferenceList="./extract-answers-reference-list"

echo "\nMise en place de la base PostgreSQL avec Docker"
docker-compose up -d postgres

echo "\nPetite pause de 5 secondes le temps que Docker reprenne son souffle"
sleep 5

echo "\nImporter les données à partir de la liste"
pg_restore --clean --if-exists --verbose --host localhost --no-owner --no-privileges --schema=public --dbname postgres --user postgres ${pgFile}  -j 2 -L ${extractAnswersReferenceList}

echo "\nDébut de l'extraction depuis la date $date dans les fichiers extractanswers-$day"

# Récupération des données sur la base de données
psql -d ${database} -t -A -F"," -c "CREATE EXTENSION pgcrypto;"

psql -d ${database} -t -A -F"," -c "
SELECT
  DISTINCT SUBSTRING(encode(digest(answers.id::TEXT, 'sha256'), 'hex'), 0,21)           AS \"answerId\",
  CONCAT('\"', REPLACE(REPLACE(REPLACE(answers.value, '\"', ''), chr(10), ''), '''',''), '\"') AS \"value\",
  answers.result,
  answers.\"createdAt\",
  answers.\"challengeId\",
  CONCAT('\"', REPLACE(REPLACE(REPLACE(answers.\"resultDetails\", '\"', ''), chr(10), ''), '''',''), '\"') AS \"resultDetails\",
  SUBSTRING(encode(digest(assessments.id::TEXT, 'sha256'), 'hex'),0,21)       AS \"assessmentId\",
  SUBSTRING(encode(digest(assessments.\"userId\"::TEXT, 'sha256'), 'hex'),0,21) AS \"userId\",
  \"assessment-results\".\"level\",
  \"assessment-results\".\"pixScore\",
  assessments.\"type\",
  assessments.\"state\"
FROM answers, assessments, \"assessment-results\"
WHERE answers.\"assessmentId\" = assessments.id AND assessments.type <> 'DEMO' AND
    \"assessment-results\".\"assessmentId\" = assessments.id AND
    answers.\"createdAt\" > '$date'
ORDER BY answers.\"createdAt\";" > output_answers.csv

# Split en plusieurs fichiers pour éviter les fichiers trop gros (max 250Mo)
mkdir extractions
rm ./extractions/extractanswers-*
split -l 800000 output_answers.csv extractions/extractanswers-${day}
splitfile=$(ls extractions)

# On se déplace dans le dossier extractions pour effectuer nos traitements
cd ./extractions
echo "\nDans $PWD"

# Ajout de la ligne de header du csv sur tous les fichiers
for file in ${splitfile}
do
echo "Façonnage de ${file}"
echo 'answerId,value,result,createdAt,challengeId,resultDetails,assessmentId,userId,level,pixScore,type,state' > ${file}.csv
cat ${file} >> ${file}.csv
rm ${file}
done

# On retourne dans le dossier /scripts pour nettoyer ce qui a été généré
cd ..

# Suppression du fichier de sortie
rm output_answers.csv

echo "\nNettoyage du container Docker"

# On arrête le container postgres
docker-compose stop postgres

# On supprime le container et le volume associé
docker-compose rm --force -v postgres

echo "\nExtraction terminée, récupérez les fichiers dans le dossier /extractions\n"
