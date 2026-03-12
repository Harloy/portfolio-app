package handler

import (
    "encoding/json"
    "fmt"
    "net/http"

    "github.com/yourname/portfolio-app/internal/middleware"
    "github.com/yourname/portfolio-app/internal/model"
    "github.com/yourname/portfolio-app/internal/service"
)

type PortfolioHandler struct{ svc *service.PortfolioService }

func NewPortfolioHandler(svc *service.PortfolioService) *PortfolioHandler {
    return &PortfolioHandler{svc: svc}
}

func (h *PortfolioHandler) GetMy(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value(middleware.UserIDKey).(int)
    p, err := h.svc.GetMy(userID)
    if err != nil { http.Error(w, "портфолио не найдено", http.StatusNotFound); return }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(p)
}

func (h *PortfolioHandler) Save(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value(middleware.UserIDKey).(int)
    var body struct {
        Title       string        `json:"title"`
        Description string        `json:"description"`
        Category    string        `json:"category"`
        Theme       string        `json:"theme"`
        Blocks      []model.Block `json:"blocks"`
    }
    json.NewDecoder(r.Body).Decode(&body)
    if body.Theme == "" { body.Theme = "{}" }
    p, err := h.svc.Save(userID, body.Title, body.Description, body.Category, body.Theme, body.Blocks)
    if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(p)
}

func (h *PortfolioHandler) Search(w http.ResponseWriter, r *http.Request) {
    query := r.URL.Query().Get("q")
    category := r.URL.Query().Get("category")
    portfolios, err := h.svc.Search(query, category)
    if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }
    w.Header().Set("Content-Type", "application/json")
    if portfolios == nil { portfolios = []model.Portfolio{} }
    json.NewEncoder(w).Encode(portfolios)
}

func (h *PortfolioHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    idStr := r.URL.Query().Get("id")
    id := 0
    fmt.Sscanf(idStr, "%d", &id)
    if id == 0 { http.Error(w, "invalid id", http.StatusBadRequest); return }
    p, err := h.svc.GetByID(id)
    if err != nil { http.Error(w, "не найдено", http.StatusNotFound); return }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(p)
}

func (h *PortfolioHandler) GetByUsername(w http.ResponseWriter, r *http.Request) {
    username := r.URL.Query().Get("username")
    if username == "" { http.Error(w, "username required", http.StatusBadRequest); return }
    p, err := h.svc.GetByUsername(username)
    if err != nil { http.Error(w, "не найдено", http.StatusNotFound); return }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(p)
}
