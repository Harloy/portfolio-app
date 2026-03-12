package repository

import (
    "database/sql"
    "github.com/yourname/portfolio-app/internal/model"
)

type PortfolioRepo struct{ db *sql.DB }

func NewPortfolioRepo(db *sql.DB) *PortfolioRepo {
    return &PortfolioRepo{db: db}
}

func (r *PortfolioRepo) Create(p *model.Portfolio) error {
    return r.db.QueryRow(
        `INSERT INTO portfolios (user_id, title, description, category)
         VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
        p.UserID, p.Title, p.Description, p.Category,
    ).Scan(&p.ID, &p.CreatedAt)
}

func (r *PortfolioRepo) GetByUserID(userID int) (*model.Portfolio, error) {
    p := &model.Portfolio{}
    var title, description, category, theme sql.NullString
    err := r.db.QueryRow(
        `SELECT id, user_id, title, description, category, score, COALESCE(theme,'{}'), created_at
         FROM portfolios WHERE user_id = $1`, userID,
    ).Scan(&p.ID, &p.UserID, &title, &description, &category, &p.Score, &theme, &p.CreatedAt)
    if err != nil { return nil, err }
    p.Title = title.String; p.Description = description.String
    p.Category = category.String; p.Theme = theme.String
    return p, nil
}

func (r *PortfolioRepo) Upsert(p *model.Portfolio) error {
    return r.db.QueryRow(
        `INSERT INTO portfolios (user_id, title, description, category, theme)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id)
         DO UPDATE SET title=$2, description=$3, category=$4, theme=$5
         RETURNING id, created_at`,
        p.UserID, p.Title, p.Description, p.Category, p.Theme,
    ).Scan(&p.ID, &p.CreatedAt)
}

func (r *PortfolioRepo) GetByID(id int) (*model.Portfolio, error) {
    p := &model.Portfolio{}
    var title, description, category, theme sql.NullString
    err := r.db.QueryRow(
        `SELECT id, user_id, title, description, category, score, COALESCE(theme,'{}'), created_at
         FROM portfolios WHERE id = $1`, id,
    ).Scan(&p.ID, &p.UserID, &title, &description, &category, &p.Score, &theme, &p.CreatedAt)
    if err != nil { return nil, err }
    p.Title = title.String; p.Description = description.String
    p.Category = category.String; p.Theme = theme.String
    return p, nil
}

func (r *PortfolioRepo) GetByUsername(username string) (*model.Portfolio, error) {
    p := &model.Portfolio{}
    var title, description, category, theme sql.NullString
    err := r.db.QueryRow(
        `SELECT p.id, p.user_id, p.title, p.description, p.category, p.score, COALESCE(p.theme,'{}'), p.created_at
         FROM portfolios p JOIN users u ON u.id = p.user_id
         WHERE u.username = $1`, username,
    ).Scan(&p.ID, &p.UserID, &title, &description, &category, &p.Score, &theme, &p.CreatedAt)
    if err != nil { return nil, err }
    p.Title = title.String; p.Description = description.String
    p.Category = category.String; p.Theme = theme.String
    return p, nil
}

func (r *PortfolioRepo) Search(query, category string) ([]model.Portfolio, error) {
    rows, err := r.db.Query(
        `SELECT id, user_id, COALESCE(title,''), COALESCE(description,''), COALESCE(category,''), score, created_at
         FROM portfolios
         WHERE ($1 = '' OR LOWER(COALESCE(title,'') || ' ' || COALESCE(description,'')) LIKE LOWER('%' || $1 || '%'))
         AND   ($2 = '' OR category = $2)
         ORDER BY score DESC, created_at DESC LIMIT 20`,
        query, category,
    )
    if err != nil { return nil, err }
    defer rows.Close()
    var result []model.Portfolio
    for rows.Next() {
        var p model.Portfolio
        rows.Scan(&p.ID, &p.UserID, &p.Title, &p.Description, &p.Category, &p.Score, &p.CreatedAt)
        result = append(result, p)
    }
    return result, nil
}
