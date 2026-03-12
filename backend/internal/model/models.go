package model

import "time"

type User struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	Username  string    `json:"username"`
	City      string    `json:"city"`
	AvatarURL string    `json:"avatar_url"`
	CreatedAt time.Time `json:"created_at"`
}

type Portfolio struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	AvatarURL   string    `json:"avatar_url"`
	Status      string    `json:"status"`
	Score       int       `json:"score"`
	Theme       string    `json:"theme"`
	Blocks      []Block   `json:"blocks"`
	Tags        []string  `json:"tags"`
	CreatedAt   time.Time `json:"created_at"`
}

type Block struct {
	ID          int    `json:"id"`
	PortfolioID int    `json:"portfolio_id"`
	Type        string `json:"type"`
	Label       string `json:"label"`
	Content     string `json:"content"`
	Style       string `json:"style"`
	Position    int    `json:"position"`
	IsFeatured  bool   `json:"is_featured"`
}
