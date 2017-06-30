import sqlite3
conn = sqlite3.connect('db/dev.sqlite3')
c = conn.cursor()
c.execute('SELECT COUNT(*) FROM scenarios')
print(c.fetchone())
