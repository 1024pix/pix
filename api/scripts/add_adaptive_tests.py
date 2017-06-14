import json, sqlite3, csv, sys
connection = sqlite3.connect('../db/dev.sqlite3')

filename = sys.argv[1]

if filename.endswith('json'):
    with open(filename) as f:
        scenarios = json.load(f)['scenarios']
else:
    with open(filename) as csvfile:
        reader = csv.reader(csvfile)
        scenarios = []
        for line in reader:
            scenarios.append(line)

c = connection.cursor()
c.executemany('INSERT INTO scenarios VALUES (NULL, ?, ?, ?, datetime("now"), datetime("now"))', scenarios)

connection.commit()
connection.close()
