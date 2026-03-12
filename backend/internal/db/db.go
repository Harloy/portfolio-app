package db

import (
    "database/sql"
    "log/slog"
    _ "github.com/lib/pq"
)

func Connect(url string) (*sql.DB, error) {
    db, err := sql.Open("postgres", url)
    if err != nil {
        return nil, err
    }
    if err := db.Ping(); err != nil {
        return nil, err
    }
    slog.Info("Connected to database")
    return db, nil
}

func Migrate(db *sql.DB) error {
    _, err := db.Exec(Schema)
    if err != nil {
        return err
    }
    slog.Info("Migrations applied")
    return nil
}