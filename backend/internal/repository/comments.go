package repository

import (
	"database/sql"
	"time"
)

type Comment struct {
	ID          int       `json:"id"`
	PortfolioID int       `json:"portfolio_id"`
	AuthorName  string    `json:"author_name"`
	Text        string    `json:"text"`
	CreatedAt   time.Time `json:"created_at"`
}

type CommentRepo struct{ db *sql.DB }

func NewCommentRepo(db *sql.DB) *CommentRepo { return &CommentRepo{db: db} }

func (r *CommentRepo) Add(portfolioID int, authorName, text string) (*Comment, error) {
	c := &Comment{PortfolioID: portfolioID, AuthorName: authorName, Text: text}
	err := r.db.QueryRow(
		`INSERT INTO comments (portfolio_id, author_name, text) VALUES ($1,$2,$3) RETURNING id, created_at`,
		portfolioID, authorName, text,
	).Scan(&c.ID, &c.CreatedAt)
	return c, err
}

func (r *CommentRepo) GetByPortfolio(portfolioID int) ([]Comment, error) {
	rows, err := r.db.Query(
		`SELECT id, portfolio_id, author_name, text, created_at
         FROM comments WHERE portfolio_id=$1 ORDER BY created_at DESC LIMIT 50`, portfolioID)
	if err != nil { return nil, err }
	defer rows.Close()
	var result []Comment
	for rows.Next() {
		var c Comment
		rows.Scan(&c.ID, &c.PortfolioID, &c.AuthorName, &c.Text, &c.CreatedAt)
		result = append(result, c)
	}
	return result, nil
}

func (r *CommentRepo) Delete(commentID int) error {
	_, err := r.db.Exec(`DELETE FROM comments WHERE id=$1`, commentID)
	return err
}
