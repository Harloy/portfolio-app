package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/yourname/portfolio-app/internal/model"
)

type PortfolioRepo struct{ db *sql.DB }

func NewPortfolioRepo(db *sql.DB) *PortfolioRepo { return &PortfolioRepo{db: db} }

func (r *PortfolioRepo) Upsert(p *model.Portfolio) error {
	return r.db.QueryRow(
		`INSERT INTO portfolios (user_id, title, description, category, theme)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (user_id) DO UPDATE
         SET title=$2, description=$3, category=$4, theme=$5
         RETURNING id, created_at`,
		p.UserID, p.Title, p.Description, p.Category, p.Theme,
	).Scan(&p.ID, &p.CreatedAt)
}

func (r *PortfolioRepo) GetByUserID(userID int) (*model.Portfolio, error) {
	p := &model.Portfolio{}
	var title, description, category, theme sql.NullString
	err := r.db.QueryRow(
		`SELECT id, user_id, title, description, category, score, COALESCE(theme,'{}'), created_at
         FROM portfolios WHERE user_id=$1`, userID,
	).Scan(&p.ID, &p.UserID, &title, &description, &category, &p.Score, &theme, &p.CreatedAt)
	if err != nil { return nil, err }
	p.Title = title.String; p.Description = description.String
	p.Category = category.String; p.Theme = theme.String
	return p, nil
}

func (r *PortfolioRepo) GetByID(id int) (*model.Portfolio, error) {
	p := &model.Portfolio{}
	var title, description, category, theme sql.NullString
	err := r.db.QueryRow(
		`SELECT id, user_id, title, description, category, score, COALESCE(theme,'{}'), created_at
         FROM portfolios WHERE id=$1`, id,
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
         FROM portfolios p JOIN users u ON u.id=p.user_id
         WHERE u.username=$1`, username,
	).Scan(&p.ID, &p.UserID, &title, &description, &category, &p.Score, &theme, &p.CreatedAt)
	if err != nil { return nil, err }
	p.Title = title.String; p.Description = description.String
	p.Category = category.String; p.Theme = theme.String
	return p, nil
}

func (r *PortfolioRepo) RecordVisit(portfolioID int) error {
	_, err := r.db.Exec(`INSERT INTO portfolio_visits (portfolio_id) VALUES ($1)`, portfolioID)
	if err != nil { return err }
	_, err = r.db.Exec(`
		UPDATE portfolios SET score = (
			SELECT COALESCE(SUM(
				CASE
					WHEN visited_at > NOW() - INTERVAL '1 day'  THEN 10
					WHEN visited_at > NOW() - INTERVAL '7 days' THEN 3
					ELSE 1
				END
			), 0)
			FROM portfolio_visits
			WHERE portfolio_id = $1
			  AND visited_at > NOW() - INTERVAL '30 days'
		) WHERE id = $1`, portfolioID)
	return err
}

func (r *PortfolioRepo) Search(query, category string, tags []string, city, country, metro string) ([]model.Portfolio, error) {
	args := []interface{}{}
	conditions := []string{"1=1"}
	i := 1

	if query != "" {
		conditions = append(conditions, fmt.Sprintf(
			`LOWER(COALESCE(p.title,'') || ' ' || COALESCE(p.description,'')) LIKE LOWER('%%' || $%d || '%%')`, i))
		args = append(args, query); i++
	}
	if category != "" {
		conditions = append(conditions, fmt.Sprintf(`p.category = $%d`, i))
		args = append(args, category); i++
	}
	for _, tag := range tags {
		conditions = append(conditions, fmt.Sprintf(
			`EXISTS (SELECT 1 FROM portfolio_tags pt2 JOIN tags t2 ON t2.id=pt2.tag_id WHERE pt2.portfolio_id=p.id AND LOWER(t2.name)=LOWER($%d))`, i))
		args = append(args, tag); i++
	}
	if city != "" {
		conditions = append(conditions, fmt.Sprintf(
			`EXISTS (SELECT 1 FROM blocks b WHERE b.portfolio_id=p.id AND b.type='location' AND LOWER(b.content) LIKE LOWER('%%"city":"' || $%d || '%%'))`, i))
		args = append(args, city); i++
	}
	if country != "" {
		conditions = append(conditions, fmt.Sprintf(
			`EXISTS (SELECT 1 FROM blocks b WHERE b.portfolio_id=p.id AND b.type='location' AND LOWER(b.content) LIKE LOWER('%%"country":"' || $%d || '%%'))`, i))
		args = append(args, country); i++
	}
	if metro != "" {
		conditions = append(conditions, fmt.Sprintf(
			`EXISTS (SELECT 1 FROM blocks b WHERE b.portfolio_id=p.id AND b.type='location' AND LOWER(b.content) LIKE LOWER('%%"metro":"' || $%d || '%%'))`, i))
		args = append(args, metro); i++
	}

	q := fmt.Sprintf(`
		SELECT DISTINCT p.id, p.user_id,
			COALESCE(p.title,''), COALESCE(p.description,''),
			COALESCE(p.category,''), p.score, p.created_at
		FROM portfolios p
		WHERE %s
		ORDER BY p.score DESC, p.created_at DESC LIMIT 50`,
		strings.Join(conditions, " AND "))

	return r.queryList(q, args...)
}

func (r *PortfolioRepo) TopFiltered(category string, tags []string, limit int) ([]model.Portfolio, error) {
	args := []interface{}{}
	conditions := []string{"1=1"}
	i := 1
	if category != "" {
		conditions = append(conditions, fmt.Sprintf(`p.category = $%d`, i))
		args = append(args, category); i++
	}
	for _, tag := range tags {
		conditions = append(conditions, fmt.Sprintf(
			`EXISTS (SELECT 1 FROM portfolio_tags pt2 JOIN tags t2 ON t2.id=pt2.tag_id WHERE pt2.portfolio_id=p.id AND LOWER(t2.name)=LOWER($%d))`, i))
		args = append(args, tag); i++
	}
	args = append(args, limit)
	q := fmt.Sprintf(`
		SELECT DISTINCT p.id, p.user_id, COALESCE(p.title,''), COALESCE(p.description,''),
		       COALESCE(p.category,''), p.score, p.created_at
		FROM portfolios p WHERE %s
		ORDER BY p.score DESC, p.created_at DESC LIMIT $%d`,
		strings.Join(conditions, " AND "), i)
	return r.queryList(q, args...)
}

func (r *PortfolioRepo) RecentFiltered(category string, tags []string, limit int) ([]model.Portfolio, error) {
	args := []interface{}{}
	conditions := []string{"1=1"}
	i := 1
	if category != "" {
		conditions = append(conditions, fmt.Sprintf(`p.category = $%d`, i))
		args = append(args, category); i++
	}
	for _, tag := range tags {
		conditions = append(conditions, fmt.Sprintf(
			`EXISTS (SELECT 1 FROM portfolio_tags pt2 JOIN tags t2 ON t2.id=pt2.tag_id WHERE pt2.portfolio_id=p.id AND LOWER(t2.name)=LOWER($%d))`, i))
		args = append(args, tag); i++
	}
	args = append(args, limit)
	q := fmt.Sprintf(`
		SELECT DISTINCT p.id, p.user_id, COALESCE(p.title,''), COALESCE(p.description,''),
		       COALESCE(p.category,''), p.score, p.created_at
		FROM portfolios p WHERE %s
		ORDER BY p.created_at DESC LIMIT $%d`,
		strings.Join(conditions, " AND "), i)
	return r.queryList(q, args...)
}

func (r *PortfolioRepo) NearbyFiltered(city, metro, category string, tags []string, limit int) ([]model.Portfolio, error) {
	args := []interface{}{city}
	conditions := []string{
		`EXISTS (SELECT 1 FROM blocks b WHERE b.portfolio_id=p.id AND b.type='location' AND LOWER(b.content) LIKE LOWER('%"city":"' || $1 || '%'))`,
	}
	i := 2
	if metro != "" {
		conditions = append(conditions, fmt.Sprintf(
			`EXISTS (SELECT 1 FROM blocks b2 WHERE b2.portfolio_id=p.id AND b2.type='location' AND LOWER(b2.content) LIKE LOWER('%%"metro":"' || $%d || '%%'))`, i))
		args = append(args, metro); i++
	}
	if category != "" {
		conditions = append(conditions, fmt.Sprintf(`p.category = $%d`, i))
		args = append(args, category); i++
	}
	for _, tag := range tags {
		conditions = append(conditions, fmt.Sprintf(
			`EXISTS (SELECT 1 FROM portfolio_tags pt2 JOIN tags t2 ON t2.id=pt2.tag_id WHERE pt2.portfolio_id=p.id AND LOWER(t2.name)=LOWER($%d))`, i))
		args = append(args, tag); i++
	}
	args = append(args, limit)
	q := fmt.Sprintf(`
		SELECT DISTINCT p.id, p.user_id, COALESCE(p.title,''), COALESCE(p.description,''),
		       COALESCE(p.category,''), p.score, p.created_at
		FROM portfolios p WHERE %s
		ORDER BY p.score DESC LIMIT $%d`,
		strings.Join(conditions, " AND "), i)
	return r.queryList(q, args...)
}

func (r *PortfolioRepo) queryList(q string, args ...interface{}) ([]model.Portfolio, error) {
	rows, err := r.db.Query(q, args...)
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

// EnrichWithBlocks подгружает блоки и теги для списка портфолио
func (r *PortfolioRepo) EnrichWithBlocks(portfolios []model.Portfolio) ([]model.Portfolio, error) {
	if len(portfolios) == 0 { return portfolios, nil }

	ids := make([]interface{}, len(portfolios))
	placeholders := make([]string, len(portfolios))
	for i, p := range portfolios {
		ids[i] = p.ID
		placeholders[i] = fmt.Sprintf("$%d", i+1)
	}
	inClause := strings.Join(placeholders, ",")

	// Блоки
	rows, err := r.db.Query(fmt.Sprintf(
		`SELECT id, portfolio_id, type, label, COALESCE(content,''), COALESCE(style,'{}'), position
         FROM blocks WHERE portfolio_id IN (%s) ORDER BY position`, inClause), ids...)
	if err != nil { return nil, err }
	defer rows.Close()

	blockMap := map[int][]model.Block{}
	for rows.Next() {
		var b model.Block
		rows.Scan(&b.ID, &b.PortfolioID, &b.Type, &b.Label, &b.Content, &b.Style, &b.Position)
		blockMap[b.PortfolioID] = append(blockMap[b.PortfolioID], b)
	}

	// Теги
	tagRows, err := r.db.Query(fmt.Sprintf(
		`SELECT pt.portfolio_id, t.name FROM portfolio_tags pt
         JOIN tags t ON t.id=pt.tag_id
         WHERE pt.portfolio_id IN (%s)`, inClause), ids...)
	if err != nil { return nil, err }
	defer tagRows.Close()

	tagMap := map[int][]string{}
	for tagRows.Next() {
		var pid int; var name string
		tagRows.Scan(&pid, &name)
		tagMap[pid] = append(tagMap[pid], name)
	}

	for i := range portfolios {
		portfolios[i].Blocks = blockMap[portfolios[i].ID]
		portfolios[i].Tags   = tagMap[portfolios[i].ID]
	}
	return portfolios, nil
}
