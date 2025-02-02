package main

import (
	"html/template"
	"log"
	"net/http"
)

func home(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("html/index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tmpl.Execute(w, nil)
}

func about(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("html/about.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tmpl.Execute(w, nil)
}

func post(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("html/examples.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tmpl.Execute(w, nil)
}

func main() {
	http.HandleFunc("/", home)

	http.HandleFunc("/about", about)
	http.HandleFunc("/post", post)

	static := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", static))

	log.Println("Listening on port :3000")
	http.ListenAndServe(":3000", nil)
}
