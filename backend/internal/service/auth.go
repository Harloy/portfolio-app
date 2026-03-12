package service

import (
    "errors"
    "os"
    "time"

    "github.com/golang-jwt/jwt/v5"
    "github.com/yourname/portfolio-app/internal/model"
    "github.com/yourname/portfolio-app/internal/repository"
    "golang.org/x/crypto/bcrypt"
)

type AuthService struct{ repo *repository.UserRepo }

func NewAuthService(repo *repository.UserRepo) *AuthService {
    return &AuthService{repo: repo}
}

func (s *AuthService) Register(name, email, password, username string) (string, *model.User, error) {
    hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
    if err != nil {
        return "", nil, err
    }
    u := &model.User{Name: name, Email: email, Password: string(hash), Username: username}
    if err := s.repo.Create(u); err != nil {
        return "", nil, errors.New("email или username уже занят")
    }
    token, err := generateToken(u.ID, u.Username)
    return token, u, err
}

func (s *AuthService) Login(email, password string) (string, *model.User, error) {
    u, err := s.repo.GetByEmail(email)
    if err != nil {
        return "", nil, errors.New("пользователь не найден")
    }
    if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)); err != nil {
        return "", nil, errors.New("неверный пароль")
    }
    token, err := generateToken(u.ID, u.Username)
    return token, u, err
}

func generateToken(userID int, username string) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id":  userID,
        "username": username,
        "exp":      time.Now().Add(30 * 24 * time.Hour).Unix(),
    })
    return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
