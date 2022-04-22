DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_tasks;
DROP TABLE IF EXISTS proj;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS proj_tasks;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS friends;


CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  password TEXT,
  contact TEXT, 
  workplace TEXT, 
  role TEXT,
  photo TEXT
);


CREATE TABLE IF NOT EXISTS proj (
  id SERIAL PRIMARY KEY,
  name TEXT,
  description TEXT,
  due_date TEXT,
  status TEXT,
  progress INTEGER,
  created_by INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  name TEXT,  
  due_date TEXT,
  accepted TEXT,
  status TEXT, 
  created_by INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proj_tasks (
  id SERIAL PRIMARY KEY,
  proj_id INTEGER,
  task_id INTEGER
);

CREATE TABLE IF NOT EXISTS user_tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  task_id INTEGER
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  send_to INTEGER,
  task_id INTEGER,
  -- pending, rejected, accepted
  accept TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS friends (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  friend_id INTEGER
);