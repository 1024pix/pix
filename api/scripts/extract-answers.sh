#!/usr/bin/sh
date=$1
database=$2
day="$(echo $date | cut -d' ' -f1)"

echo "Début de l'extraction depuis la date $date dans des fichiers extractanswers-$day"

# Récupération des données sur la base de données
psql -d $database -t -A -F"," -c "
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
split --lines=1000000 --additional-suffix=.csv output_answers.csv extractanswers-$day
splitfile=$(find -maxdepth 1 -name "*extractanswers*")

# Ajout de la ligne de header du csv sur tous les fichiers
for file in $splitfile
do
sed -i '1s/^/answerId,value,result,createdAt,challengeId,elapsedTime,resultDetails,assessmentId,userId,level,pixScore,type,state\n/' $file
done

# Suppression du fichier de sortie
rm output_answers.csv
echo "Extraction terminée, récupérez les fichiers: \n $splitfile"
