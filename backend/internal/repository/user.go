package repository

import (
    "database/sql"
    "github.com/yourname/portfolio-app/internal/model"
)

type UserRepo struct{ db *sql.DB }

func NewUserRepo(db *sql.DB) *UserRepo {
    return &UserRepo{db: db}
}

func (r *UserRepo) Create(u *model.User) error {
    return r.db.QueryRow(
        `INSERT INTO users (name, email, password, username)
         VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
        u.Name, u.Email, u.Password, u.Username,
    ).Scan(&u.ID, &u.CreatedAt)
}

func (r *UserRepo) GetByEmail(email string) (*model.User, error) {
    u := &model.User{}
    var city, avatarURL, username sql.NullString
    err := r.db.QueryRow(
        `SELECT id, name, email, password, username, city, avatar_url, created_at
         FROM users WHERE email = $1`, email,
    ).Scan(&u.ID, &u.Name, &u.Email, &u.Password, &username, &city, &avatarURL, &u.CreatedAt)
    if err != nil {
        return nil, err
    }
    u.Username  = username.String
    u.City      = city.String
    u.AvatarURL = avatarURL.String
    return u, nil
}
