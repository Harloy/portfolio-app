package handler

import (
    "encoding/json"
    "net/http"

    "github.com/yourname/portfolio-app/internal/service"
)

type AuthHandler struct{ svc *service.AuthService }

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
    return &AuthHandler{svc: svc}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
    var body struct {
        Name     string `json:"name"`
        Email    string `json:"email"`
        Password string `json:"password"`
        Username string `json:"username"`
    }
    json.NewDecoder(r.Body).Decode(&body)

    token, user, err := h.svc.Register(body.Name, body.Email, body.Password, body.Username)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "token":    token,
        "username": user.Username,
        "name":     user.Name,
        "id":       user.ID,
    })
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
    var body struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    json.NewDecoder(r.Body).Decode(&body)

    token, user, err := h.svc.Login(body.Email, body.Password)
    if err != nil {
        http.Error(w, err.Error(), http.StatusUnauthorized)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "token":    token,
        "username": user.Username,
        "name":     user.Name,
        "id":       user.ID,
    })
}
