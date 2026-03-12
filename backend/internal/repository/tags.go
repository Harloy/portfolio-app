package repository

import "database/sql"

type TagRepo struct{ db *sql.DB }

func NewTagRepo(db *sql.DB) *TagRepo { return &TagRepo{db: db} }

func (r *TagRepo) SetPortfolioTags(portfolioID int, tags []string) error {
	_, err := r.db.Exec(`DELETE FROM portfolio_tags WHERE portfolio_id=$1`, portfolioID)
	if err != nil { return err }
	for _, name := range tags {
		if name == "" { continue }
		var tagID int
		err = r.db.QueryRow(
			`INSERT INTO tags (name) VALUES ($1)
             ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name
             RETURNING id`, name,
		).Scan(&tagID)
		if err != nil { return err }
		_, err = r.db.Exec(
			`INSERT INTO portfolio_tags (portfolio_id, tag_id) VALUES ($1,$2)
             ON CONFLICT DO NOTHING`, portfolioID, tagID)
		if err != nil { return err }
	}
	return nil
}

func (r *TagRepo) GetPortfolioTags(portfolioID int) ([]string, error) {
	rows, err := r.db.Query(
		`SELECT t.name FROM tags t
         JOIN portfolio_tags pt ON pt.tag_id=t.id
         WHERE pt.portfolio_id=$1 ORDER BY t.name`, portfolioID)
	if err != nil { return nil, err }
	defer rows.Close()
	var tags []string
	for rows.Next() {
		var name string
		rows.Scan(&name)
		tags = append(tags, name)
	}
	return tags, nil
}

// TagsByProfession — популярные теги внутри профессии
func (r *TagRepo) TagsByProfession(category string) ([]string, error) {
	rows, err := r.db.Query(`
		SELECT t.name, COUNT(*) as cnt
		FROM tags t
		JOIN portfolio_tags pt ON pt.tag_id=t.id
		JOIN portfolios p ON p.id=pt.portfolio_id
		WHERE ($1='' OR p.category=$1)
		GROUP BY t.name ORDER BY cnt DESC LIMIT 30`, category)
	if err != nil { return nil, err }
	defer rows.Close()
	var tags []string
	for rows.Next() {
		var name string; var cnt int
		rows.Scan(&name, &cnt)
		tags = append(tags, name)
	}
	return tags, nil
}
