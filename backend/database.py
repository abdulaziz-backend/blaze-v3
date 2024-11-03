import sqlite3
import os

DB_FILE = 'users.db'

CREATE_TASKS_TABLE = '''
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    reward INTEGER NOT NULL,
    imageUrl TEXT NOT NULL,
    header TEXT NOT NULL,
    link TEXT NOT NULL,
    type TEXT NOT NULL
);
'''

def create():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute(CREATE_TASKS_TABLE)
        
        conn.commit()
        print(f"Database '{DB_FILE}' and 'tasks' table created successfully.")
    except sqlite3.Error as e:
        print(f"An error occurred while creating the database: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    create()