package main

import (
    "log/slog"
    "net/http"
    "os"

    "github.com/go-chi/chi/v5"
    chiMiddleware "github.com/go-chi/chi/v5/middleware"
    "github.com/yourname/portfolio-app/internal/db"
    "github.com/yourname/portfolio-app/internal/handler"
    "github.com/yourname/portfolio-app/internal/middleware"
    "github.com/yourname/portfolio-app/internal/repository"
    "github.com/yourname/portfolio-app/internal/service"
)

func main() {
    slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, nil)))

    database, err := db.Connect(os.Getenv("DATABASE_URL"))
    if err != nil {
        slog.Error("DB connection failed", "err", err)
        os.Exit(1)
    }
    if err := db.Migrate(database); err != nil {
        slog.Error("Migration failed", "err", err)
        os.Exit(1)
    }

    // Репозитории
    userRepo      := repository.NewUserRepo(database)
    portfolioRepo := repository.NewPortfolioRepo(database)
    blockRepo     := repository.NewBlockRepo(database)

    // Сервисы
    authSvc      := service.NewAuthService(userRepo)
    portfolioSvc := service.NewPortfolioService(portfolioRepo, blockRepo)

    // Хендлеры
    authHandler      := handler.NewAuthHandler(authSvc)
    portfolioHandler := handler.NewPortfolioHandler(portfolioSvc)

    r := chi.NewRouter()
    r.Use(chiMiddleware.Logger)
    r.Use(chiMiddleware.Recoverer)
    r.Use(func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
            w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
            w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
            if r.Method == "OPTIONS" { w.WriteHeader(204); return }
            next.ServeHTTP(w, r)
        })
    })

    r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("ok"))
    })

    r.Route("/api", func(r chi.Router) {
        r.Post("/auth/register", authHandler.Register)
        r.Post("/auth/login",    authHandler.Login)
        r.Get("/portfolio/search", portfolioHandler.Search)
		r.Get("/portfolio", portfolioHandler.GetByID)
		r.Get("/portfolio/user", portfolioHandler.GetByUsername)

        // Защищённые роуты
        r.Group(func(r chi.Router) {
            r.Use(middleware.Auth)
            r.Get("/portfolio/my",  portfolioHandler.GetMy)
            r.Post("/portfolio",    portfolioHandler.Save)
        })
    })
    

    port := os.Getenv("PORT")
    slog.Info("Server started", "port", port)
    http.ListenAndServe(":"+port, r)
}