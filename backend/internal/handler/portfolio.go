package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/yourname/portfolio-app/internal/middleware"
	"github.com/yourname/portfolio-app/internal/model"
	"github.com/yourname/portfolio-app/internal/service"
)

type PortfolioHandler struct{ svc *service.PortfolioService }

func NewPortfolioHandler(svc *service.PortfolioService) *PortfolioHandler {
	return &PortfolioHandler{svc: svc}
}

func jsonOK(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func parseTags(raw string) []string {
	var tags []string
	for _, t := range strings.Split(raw, ",") {
		if t = strings.TrimSpace(t); t != "" {
			tags = append(tags, t)
		}
	}
	return tags
}

func (h *PortfolioHandler) GetMy(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int)
	p, err := h.svc.GetMy(userID)
	if err != nil { http.Error(w, "не найдено", http.StatusNotFound); return }
	jsonOK(w, p)
}

func (h *PortfolioHandler) Save(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int)
	var body struct {
		Title       string        `json:"title"`
		Description string        `json:"description"`
		Category    string        `json:"category"`
		Theme       string        `json:"theme"`
		AvatarURL   string        `json:"avatar_url"`
		Status      string        `json:"status"`
		Blocks      []model.Block `json:"blocks"`
		Tags        []string      `json:"tags"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if body.Theme == "" { body.Theme = "{}" }
	p, err := h.svc.Save(userID, body.Title, body.Description, body.Category,
		body.Theme, body.AvatarURL, body.Status, body.Blocks, body.Tags)
	if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }
	jsonOK(w, p)
}

func (h *PortfolioHandler) Search(w http.ResponseWriter, r *http.Request) {
	query    := r.URL.Query().Get("q")
	category := r.URL.Query().Get("category")
	city     := r.URL.Query().Get("city")
	country  := r.URL.Query().Get("country")
	metro    := r.URL.Query().Get("metro")
	tags     := parseTags(r.URL.Query().Get("tags"))

	portfolios, err := h.svc.Search(query, category, tags, city, country, metro)
	if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }
	if portfolios == nil { portfolios = []model.Portfolio{} }
	jsonOK(w, portfolios)
}

func (h *PortfolioHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id := 0; fmt.Sscanf(idStr, "%d", &id)
	if id == 0 { http.Error(w, "invalid id", http.StatusBadRequest); return }
	p, err := h.svc.GetByID(id)
	if err != nil { http.Error(w, "не найдено", http.StatusNotFound); return }
	jsonOK(w, p)
}

func (h *PortfolioHandler) GetByUsername(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" { http.Error(w, "username required", http.StatusBadRequest); return }
	p, err := h.svc.GetByUsername(username)
	if err != nil { http.Error(w, "не найдено", http.StatusNotFound); return }
	jsonOK(w, p)
}

func (h *PortfolioHandler) RecordVisit(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id := 0; fmt.Sscanf(idStr, "%d", &id)
	if id == 0 { http.Error(w, "invalid id", http.StatusBadRequest); return }
	h.svc.RecordVisit(id)
	w.WriteHeader(http.StatusNoContent)
}

func (h *PortfolioHandler) Home(w http.ResponseWriter, r *http.Request) {
	q        := r.URL.Query()
	category := q.Get("category")
	city     := q.Get("city")
	metro    := q.Get("metro")
	sort     := q.Get("sort")
	tags     := parseTags(q.Get("tags"))
	empty    := []model.Portfolio{}

	limit := 6
	if l, err := strconv.Atoi(q.Get("limit")); err == nil && l > 0 { limit = l }

	switch sort {
	case "nearby":
		var nearby []model.Portfolio
		if city != "" {
			nearby, _ = h.svc.NearbyFiltered(city, metro, category, tags, limit)
		}
		if len(nearby) == 0 {
			nearby, _ = h.svc.TopFiltered(category, tags, limit)
		}
		if nearby == nil { nearby = empty }
		jsonOK(w, map[string]interface{}{"nearby": nearby})

	case "recent":
		recent, _ := h.svc.RecentFiltered(category, tags, limit)
		if recent == nil { recent = empty }
		jsonOK(w, map[string]interface{}{"recent": recent})

	default:
		top, _ := h.svc.TopFiltered(category, tags, limit)
		if top == nil { top = empty }
		jsonOK(w, map[string]interface{}{"top": top})
	}
}

func (h *PortfolioHandler) TagsByProfession(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	tags, err := h.svc.TagsByProfession(category)
	if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }
	if tags == nil { tags = []string{} }
	jsonOK(w, tags)
}
