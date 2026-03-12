package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/yourname/portfolio-app/internal/repository"
)

type CommentHandler struct{ repo *repository.CommentRepo }

func NewCommentHandler(repo *repository.CommentRepo) *CommentHandler {
	return &CommentHandler{repo: repo}
}

func (h *CommentHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	id := 0; fmt.Sscanf(r.URL.Query().Get("portfolio_id"), "%d", &id)
	if id == 0 { http.Error(w, "portfolio_id required", http.StatusBadRequest); return }
	comments, err := h.repo.GetByPortfolio(id)
	if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }
	if comments == nil { comments = []repository.Comment{} }
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func (h *CommentHandler) AddComment(w http.ResponseWriter, r *http.Request) {
	var body struct {
		PortfolioID int    `json:"portfolio_id"`
		AuthorName  string `json:"author_name"`
		Text        string `json:"text"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if body.PortfolioID == 0 || body.Text == "" {
		http.Error(w, "portfolio_id and text required", http.StatusBadRequest); return
	}
	if body.AuthorName == "" { body.AuthorName = "Аноним" }
	c, err := h.repo.Add(body.PortfolioID, body.AuthorName, body.Text)
	if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c)
}

func (h *CommentHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	id := 0; fmt.Sscanf(r.URL.Query().Get("id"), "%d", &id)
	if id == 0 { http.Error(w, "id required", http.StatusBadRequest); return }
	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError); return
	}
	w.WriteHeader(http.StatusNoContent)
}
