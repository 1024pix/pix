#!/usr/bin/sh
# Utilisation :
# Avoir sur un postgres la base sur laquelle on souhaite extraire les réponses
# sh ./extract-answers.sh "2018-11-28 12:45:04.713526+00" postgresql://postgres:@localhost:5432/postgres

pgFile=$1
date=$2
database=$3
day="$(echo ${date} | cut -d' ' -f1)"
extractAnswersReferenceList="./extract-answers-reference-list"

echo "\nRemonter la base PostgreSQL"
docker stop pix-db-pg
docker rm pix-db-pg
docker run --name pix-db-pg -e POSTGRES_DB=pix -dit -p 5432:5432 postgres

echo "\nWaiting 5 seconds to let docker catch his breath"
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
  answers.\"elapsedTime\",
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
split -l 800000 output_answers.csv extractanswers-${day}
splitfile=$(find . -d 1 -name "*extractanswers*")

# Ajout de la ligne de header du csv sur tous les fichiers
for file in ${splitfile}
do
sed -i '' '1s/^/answerId,value,result,createdAt,challengeId,elapsedTime,resultDetails,assessmentId,userId,level,pixScore,type,state\n/' ${file}
mv ${file} ${file}.csv
done

# Suppression du fichier de sortie
rm output_answers.csv
echo "\nExtraction terminée, récupérez les fichiers: \n$splitfile"
