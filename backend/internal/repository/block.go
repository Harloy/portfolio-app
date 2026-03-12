package repository

import (
    "database/sql"
    "github.com/yourname/portfolio-app/internal/model"
)

type BlockRepo struct{ db *sql.DB }

func NewBlockRepo(db *sql.DB) *BlockRepo {
    return &BlockRepo{db: db}
}

func (r *BlockRepo) ReplaceAll(portfolioID int, blocks []model.Block) error {
    tx, err := r.db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    _, err = tx.Exec(`DELETE FROM blocks WHERE portfolio_id = $1`, portfolioID)
    if err != nil {
        return err
    }

    for i, b := range blocks {
        _, err = tx.Exec(
            `INSERT INTO blocks (portfolio_id, type, label, content, position)
             VALUES ($1, $2, $3, $4, $5)`,
            portfolioID, b.Type, b.Label, b.Content, i,
        )
        if err != nil {
            return err
        }
    }
    return tx.Commit()
}

func (r *BlockRepo) GetByPortfolioID(portfolioID int) ([]model.Block, error) {
    rows, err := r.db.Query(
        `SELECT id, portfolio_id, type, label, content, position
         FROM blocks WHERE portfolio_id = $1 ORDER BY position`, portfolioID,
    )
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var blocks []model.Block
    for rows.Next() {
        var b model.Block
        rows.Scan(&b.ID, &b.PortfolioID, &b.Type, &b.Label, &b.Content, &b.Position)
        blocks = append(blocks, b)
    }
    return blocks, nil
}