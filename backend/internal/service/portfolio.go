package service

import (
	"github.com/yourname/portfolio-app/internal/model"
	"github.com/yourname/portfolio-app/internal/repository"
)

type PortfolioService struct {
	portfolioRepo *repository.PortfolioRepo
	blockRepo     *repository.BlockRepo
	tagRepo       *repository.TagRepo
}

func NewPortfolioService(pr *repository.PortfolioRepo, br *repository.BlockRepo, tr *repository.TagRepo) *PortfolioService {
	return &PortfolioService{portfolioRepo: pr, blockRepo: br, tagRepo: tr}
}

func (s *PortfolioService) enrich(ps []model.Portfolio, err error) ([]model.Portfolio, error) {
	if err != nil || len(ps) == 0 { return ps, err }
	result, enrichErr := s.portfolioRepo.EnrichWithBlocks(ps)
	if enrichErr != nil { return ps, enrichErr }
	return result, nil
}

func (s *PortfolioService) Save(userID int, title, description, category, theme, avatarURL, status string, blocks []model.Block, tags []string) (*model.Portfolio, error) {
	p := &model.Portfolio{
		UserID: userID, Title: title, Description: description,
		Category: category, Theme: theme, AvatarURL: avatarURL, Status: status,
	}
	if err := s.portfolioRepo.Upsert(p); err != nil { return nil, err }
	if err := s.blockRepo.ReplaceAll(p.ID, blocks); err != nil { return nil, err }
	if err := s.tagRepo.SetPortfolioTags(p.ID, tags); err != nil { return nil, err }
	p.Blocks = blocks; p.Tags = tags
	return p, nil
}

func (s *PortfolioService) withBlocks(p *model.Portfolio) (*model.Portfolio, error) {
	blocks, err := s.blockRepo.GetByPortfolioID(p.ID)
	if err != nil { return nil, err }
	tags, _ := s.tagRepo.GetPortfolioTags(p.ID)
	p.Blocks = blocks; p.Tags = tags
	return p, nil
}

func (s *PortfolioService) GetMy(userID int) (*model.Portfolio, error) {
	p, err := s.portfolioRepo.GetByUserID(userID)
	if err != nil { return nil, err }
	return s.withBlocks(p)
}

func (s *PortfolioService) GetByID(id int) (*model.Portfolio, error) {
	p, err := s.portfolioRepo.GetByID(id)
	if err != nil { return nil, err }
	return s.withBlocks(p)
}

func (s *PortfolioService) GetByUsername(username string) (*model.Portfolio, error) {
	p, err := s.portfolioRepo.GetByUsername(username)
	if err != nil { return nil, err }
	return s.withBlocks(p)
}

func (s *PortfolioService) RecordVisit(portfolioID int) error {
	return s.portfolioRepo.RecordVisit(portfolioID)
}

func (s *PortfolioService) Search(query, category string, tags []string, city, country, metro string) ([]model.Portfolio, error) {
	return s.enrich(s.portfolioRepo.Search(query, category, tags, city, country, metro))
}

func (s *PortfolioService) TopFiltered(category string, tags []string, limit int) ([]model.Portfolio, error) {
	return s.enrich(s.portfolioRepo.TopFiltered(category, tags, limit))
}

func (s *PortfolioService) RecentFiltered(category string, tags []string, limit int) ([]model.Portfolio, error) {
	return s.enrich(s.portfolioRepo.RecentFiltered(category, tags, limit))
}

func (s *PortfolioService) NearbyFiltered(city, metro, category string, tags []string, limit int) ([]model.Portfolio, error) {
	return s.enrich(s.portfolioRepo.NearbyFiltered(city, metro, category, tags, limit))
}

func (s *PortfolioService) TagsByProfession(category string) ([]string, error) {
	return s.tagRepo.TagsByProfession(category)
}
