import json, sqlite3
connection = sqlite3.connect('../api/db/dev.sqlite3')

with open('records.json') as f:
    scenarios = json.load(f)['scenarios']

c = connection.cursor()
c.executemany('INSERT INTO scenarios VALUES (NULL, ?, ?, ?, datetime("now"), datetime("now"))', scenarios)

connection.commit()
connection.close()
