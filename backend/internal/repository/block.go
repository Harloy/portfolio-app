package repository

import (
    "database/sql"
    "github.com/yourname/portfolio-app/internal/model"
)

type BlockRepo struct{ db *sql.DB }

func NewBlockRepo(db *sql.DB) *BlockRepo { return &BlockRepo{db: db} }

func (r *BlockRepo) GetByPortfolioID(portfolioID int) ([]model.Block, error) {
    rows, err := r.db.Query(
        `SELECT id, portfolio_id, type, COALESCE(label,''), COALESCE(content,''), COALESCE(style,'{}'), position
         FROM blocks WHERE portfolio_id = $1 ORDER BY position`, portfolioID,
    )
    if err != nil { return nil, err }
    defer rows.Close()
    var blocks []model.Block
    for rows.Next() {
        var b model.Block
        rows.Scan(&b.ID, &b.PortfolioID, &b.Type, &b.Label, &b.Content, &b.Style, &b.Position)
        blocks = append(blocks, b)
    }
    return blocks, nil
}

func (r *BlockRepo) ReplaceAll(portfolioID int, blocks []model.Block) error {
    _, err := r.db.Exec(`DELETE FROM blocks WHERE portfolio_id = $1`, portfolioID)
    if err != nil { return err }
    for i, b := range blocks {
        style := b.Style
        if style == "" { style = "{}" }
        _, err = r.db.Exec(
            `INSERT INTO blocks (portfolio_id, type, label, content, style, position)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            portfolioID, b.Type, b.Label, b.Content, style, i,
        )
        if err != nil { return err }
    }
    return nil
}
