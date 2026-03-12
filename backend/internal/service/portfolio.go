package service

import (
    "github.com/yourname/portfolio-app/internal/model"
    "github.com/yourname/portfolio-app/internal/repository"
)

type PortfolioService struct {
    portfolioRepo *repository.PortfolioRepo
    blockRepo     *repository.BlockRepo
}

func NewPortfolioService(pr *repository.PortfolioRepo, br *repository.BlockRepo) *PortfolioService {
    return &PortfolioService{portfolioRepo: pr, blockRepo: br}
}

func (s *PortfolioService) Save(userID int, title, description, category, theme string, blocks []model.Block) (*model.Portfolio, error) {
    p := &model.Portfolio{UserID: userID, Title: title, Description: description, Category: category, Theme: theme}
    if err := s.portfolioRepo.Upsert(p); err != nil { return nil, err }
    if err := s.blockRepo.ReplaceAll(p.ID, blocks); err != nil { return nil, err }
    p.Blocks = blocks
    return p, nil
}

func (s *PortfolioService) GetMy(userID int) (*model.Portfolio, error) {
    p, err := s.portfolioRepo.GetByUserID(userID)
    if err != nil { return nil, err }
    blocks, err := s.blockRepo.GetByPortfolioID(p.ID)
    if err != nil { return nil, err }
    p.Blocks = blocks
    return p, nil
}

func (s *PortfolioService) GetByID(id int) (*model.Portfolio, error) {
    p, err := s.portfolioRepo.GetByID(id)
    if err != nil { return nil, err }
    blocks, err := s.blockRepo.GetByPortfolioID(p.ID)
    if err != nil { return nil, err }
    p.Blocks = blocks
    return p, nil
}

func (s *PortfolioService) GetByUsername(username string) (*model.Portfolio, error) {
    p, err := s.portfolioRepo.GetByUsername(username)
    if err != nil { return nil, err }
    blocks, err := s.blockRepo.GetByPortfolioID(p.ID)
    if err != nil { return nil, err }
    p.Blocks = blocks
    return p, nil
}

func (s *PortfolioService) Search(query, category string) ([]model.Portfolio, error) {
    return s.portfolioRepo.Search(query, category)
}
