package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/yourname/portfolio-app/internal/db"
	"github.com/yourname/portfolio-app/internal/handler"
	"github.com/yourname/portfolio-app/internal/middleware"
	"github.com/yourname/portfolio-app/internal/repository"
	"github.com/yourname/portfolio-app/internal/service"
)

func main() {
	database, err := db.Connect(os.Getenv("DATABASE_URL"))
	if err != nil { slog.Error("DB connect failed", "err", err); os.Exit(1) }
	slog.Info("Connected to database")

	if err := db.Migrate(database); err != nil {
		slog.Error("Migration failed", "err", err); os.Exit(1)
	}
	slog.Info("Migrations applied")

	userRepo      := repository.NewUserRepo(database)
	portfolioRepo := repository.NewPortfolioRepo(database)
	blockRepo     := repository.NewBlockRepo(database)
	tagRepo       := repository.NewTagRepo(database)
	commentRepo   := repository.NewCommentRepo(database)

	authSvc      := service.NewAuthService(userRepo)
	portfolioSvc := service.NewPortfolioService(portfolioRepo, blockRepo, tagRepo)

	authHandler      := handler.NewAuthHandler(authSvc)
	portfolioHandler := handler.NewPortfolioHandler(portfolioSvc)
	commentHandler   := handler.NewCommentHandler(commentRepo)

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("ok")) })

	r.Route("/api", func(r chi.Router) {
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login",    authHandler.Login)

		// Публичные
		r.Get("/portfolio",        portfolioHandler.GetByID)
		r.Get("/portfolio/user",   portfolioHandler.GetByUsername)
		r.Get("/portfolio/search", portfolioHandler.Search)
		r.Get("/portfolio/home",   portfolioHandler.Home)
		r.Post("/portfolio/visit", portfolioHandler.RecordVisit)
		r.Get("/tags",             portfolioHandler.TagsByProfession)

		// Комментарии — публичные
		r.Get("/comments",  commentHandler.GetComments)
		r.Post("/comments", commentHandler.AddComment)
		// Удаление — только авторизованным
		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth)
			r.Delete("/comments", commentHandler.DeleteComment)
		})

		// Приватные
		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth)
			r.Get("/portfolio/my", portfolioHandler.GetMy)
			r.Post("/portfolio",   portfolioHandler.Save)
		})
	})

	slog.Info("Server started", "port", 8080)
	http.ListenAndServe(":8080", r)
}
