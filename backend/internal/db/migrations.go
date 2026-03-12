package db

const Schema = `
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    username   TEXT UNIQUE,
    city       TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS portfolios (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT,
    description TEXT,
    category    TEXT,
    score       INTEGER DEFAULT 0,
    theme       TEXT DEFAULT '{}',
    created_at  TIMESTAMP DEFAULT NOW()
);

ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT '{}';

CREATE TABLE IF NOT EXISTS blocks (
    id           SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    type         TEXT NOT NULL,
    label        TEXT,
    content      TEXT,
    position     INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tags (
    id   SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolio_tags (
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    tag_id       INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (portfolio_id, tag_id)
);
`
