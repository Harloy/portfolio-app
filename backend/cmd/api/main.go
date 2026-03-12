package main

import (
	"log/slog"
	"os"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)
	slog.Info("Starting server...")
	// TODO: инициализация роутера и сервера
}
