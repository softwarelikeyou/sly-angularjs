package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	_ "encoding/json"
	_ "time"
	_ "strings"
	_ "errors"
	"encoding/json"
	"crypto/rand"
	"strings"
	"github.com/gorilla/sessions"
	"github.com/gorilla/mux"
	"crypto/sha1"
	"encoding/base64"
	"errors"
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/srinathgs/mysqlstore"
	_ "path/filepath"
	"io/ioutil"
	"bytes"
)

var (
	hostname     string
	port         int
	topStaticDir string
	store *sessions.CookieStore
)

const (
	APP_DIR = "./app"
	BOWER_DIR = "./bower_components"

)

type Results struct {
	Status bool `json:"status"`
	Message string `json:"message"`
}

type User struct {
	ID int32 `json:"userId"`
	DISPLAY string `json:"displayName"`
	PASSWORD string `json:"password"`
	USERTYPE string `json:"userType"`
	USERNAME string `json:"username"`
	AUTHTOKEN string `json:"authToken"`
}

func init() {
	// Flags
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "usage: %s [default_static_dir]\n", os.Args[0])
		flag.PrintDefaults()
	}
	flag.StringVar(&hostname, "h", "localhost", "hostname")
	flag.IntVar(&port, "p", 8080, "port")
	flag.StringVar(&topStaticDir, "static_dir", "", "static directory in addition to default static directory")

	var encryptionkey = UUID()

	store = sessions.NewCookieStore([]byte(encryptionkey))

	store.Options = &sessions.Options{
		Domain: "",
		Path:     "/",
		MaxAge:   3600 * 3, // 3 hours
		HttpOnly: true,
	}

	db, err := sql.Open("mysql", "root:dinky01@tcp(127.0.0.1:3306)/test")
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	db.Close()
}

func appendStaticRoute(sr StaticRoutes, dir string) StaticRoutes {
	if _, err := os.Stat(dir); err != nil {
		log.Fatal(err)
	}
	return append(sr, http.Dir(dir))
}

type StaticRoutes []http.FileSystem

func (sr StaticRoutes) Open(name string) (f http.File, err error) {
	for _, s := range sr {
		if f, err = s.Open(name); err == nil {
			f = disabledDirListing{f}
			return
		}
	}
	return
}

type disabledDirListing struct {
	http.File
}

func (f disabledDirListing) Readdir(count int) ([]os.FileInfo, error) {
	return nil, nil
}

func login(w http.ResponseWriter, r *http.Request) {
	notFound := Results{
		Status:  false,
		Message: "Username or password is incorrect"}

	found := Results{
		Status:  true,
		Message: ""}

	r.ParseForm()

	if (len(r.Form.Get("username")) == 0) {
		b, _ := json.Marshal(notFound)
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusOK)
		w.Write(b)
		return
	}
	username := r.Form.Get("username")

	if (len(r.Form.Get("password")) == 0) {
		b, _ := json.Marshal(notFound)
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusOK)
		w.Write(b)
		return
	}
	password := r.Form.Get("password")
	encoded := SHA1Base64Encode([]byte(password))

	user, err := GetUser(username)
	if err != nil {
		b, _ := json.Marshal(notFound)
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusOK)
		w.Write(b)
		return
	}

	if encoded != user.PASSWORD || username != user.USERNAME {
		b, _ := json.Marshal(notFound)
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusOK)
		w.Write(b)
		return
	}

	b, _ := json.Marshal(found)
	session, _ := store.New(r, username)
	authtoken := base64Encode([]byte(username+":" + UUID()))
	session.Values["AuthToken"] = authtoken
	err = session.Save(r, w)
	if (err != nil) {
		fmt.Println("Unable save session")
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Header().Set("AuthToken", authtoken)
	w.WriteHeader(http.StatusOK)
	w.Write(b)
}

func userAuthenticate(w http.ResponseWriter, r *http.Request) {

	authorization := r.Header.Get("Authorization")
	if (authorization != "") {
		s := strings.SplitN(authorization, " ", 2)
		pair, err := base64Decode(s[1])
		if err != nil {
			w.WriteHeader(http.StatusNetworkAuthenticationRequired)
			w.Write([]byte("Error"))
			return
		}
		username := pair[0]
		encoded := SHA1Base64Encode([]byte(pair[1]))

		user, err := GetUser(username)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte("StatusNotFound"))
			return
		}

		if encoded != user.PASSWORD {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("StatusUnauthorized"))
			return
		}

		user.AUTHTOKEN = base64Encode([]byte(username+":" + UUID()))

		b, err := json.Marshal(user)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("StatusInternalServerError"))
			return
		}

		session, _ := store.New(r, username)
		session.Values["AuthToken"] = user.AUTHTOKEN

		err = session.Save(r, w)
		w.Header().Set("AuthToken", user.AUTHTOKEN)
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusOK)
		w.Write(b)
		return
	}

	authToken := r.Header.Get("Authtoken")
	if (authToken != "") {
		pair, err := base64Decode(authToken)
		if err != nil {
			w.WriteHeader(http.StatusNetworkAuthenticationRequired)
			w.Write([]byte("Error"))
			return
		}
		username := pair[0]
		session, err := store.Get(r, username)
		if (err != nil) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("StatusUnauthorized"))
			return
		}
		token := []byte(pair[1])
		if session.Values["AuthToken"] != string(token) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("StatusUnauthorized"))
			return
		}

		user, err := GetUser(username)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte("StatusNotFound"))
			return
		}

		user.AUTHTOKEN = string(token)
		b, err := json.Marshal(user)
		w.Header().Set("AuthToken", base64Encode([]byte(username+":" + user.AUTHTOKEN)))
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusOK)
		w.Write(b)
		return
	}

	w.WriteHeader(http.StatusNetworkAuthenticationRequired)
	w.Write([]byte("Error"))
	return
}

func getUsers(w http.ResponseWriter, r *http.Request) {
	authToken := r.Header.Get("Authtoken")
	if (authToken != "") {
		pair, err := base64Decode(authToken)
		if err != nil {
			w.WriteHeader(http.StatusNetworkAuthenticationRequired)
			w.Write([]byte("Error"))
			return
		}
		username := pair[0]
		session, err := store.Get(r, username)
		if (err != nil) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("StatusUnauthorized"))
			return
		}

		token := pair[1]
		if (session.Values["AuthToken"] == nil) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("StatusUnauthorized"))
			return
		}
		sessionToken, err := base64Decode(session.Values["AuthToken"].(string))
		if (err != nil) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("StatusUnauthorized"))
			return
		}
		if sessionToken[1] != string(token) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("StatusUnauthorized"))
			return
		}

		users, err := GetUsers()
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte("StatusNotFound"))
			return
		}

		b, err := json.Marshal(users)
		w.Header().Set("AuthToken", session.Values["AuthToken"].(string))
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusOK)
		w.Write(b)
		return
	}

	w.WriteHeader(http.StatusNetworkAuthenticationRequired)
	w.Write([]byte("Error"))
	return
}

func getUserById(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	key := vars["id"]
	if (key == "") {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("StatusNotFound"))
		return
	}

	authToken := r.Header.Get("Authtoken")
	if (authToken != "") {
		pair, err := base64Decode(authToken)
		if err != nil {
			w.WriteHeader(http.StatusNetworkAuthenticationRequired)
			w.Write([]byte("Error"))
			return
		}
		username := pair[0]
		session, err := store.Get(r, username)
		if (err != nil) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("StatusUnauthorized"))
			return
		}

		token := pair[1]
		if (session.Values["AuthToken"] == nil) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("StatusUnauthorized"))
			return
		}
		sessionToken, err := base64Decode(session.Values["AuthToken"].(string))
		if (err != nil) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("StatusUnauthorized"))
			return
		}
		if sessionToken[1] != string(token) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("StatusUnauthorized"))
			return
		}

		user, err := GetUserById(key)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte("StatusNotFound"))
			return
		}

		b, err := json.Marshal(user)
		w.Header().Set("AuthToken", session.Values["AuthToken"].(string))
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusOK)
		w.Write(b)
		return
	}

	w.WriteHeader(http.StatusNetworkAuthenticationRequired)
	w.Write([]byte("Error"))
	return
}

func getUserByUsername(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	key := vars["username"]
	if (key == "") {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	authToken := r.Header.Get("Authtoken")
	if (authToken != "") {
		pair, err := base64Decode(authToken)
		if err != nil {
			w.WriteHeader(http.StatusNetworkAuthenticationRequired)
			return
		}
		username := pair[0]
		session, err := store.Get(r, username)
		if (err != nil) {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		token := pair[1]
		if (session.Values["AuthToken"] == nil) {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		sessionToken, err := base64Decode(session.Values["AuthToken"].(string))
		if (err != nil) {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		if sessionToken[1] != string(token) {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		user, err := GetUserByUsername(key)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		b, err := json.Marshal(user)
		w.Header().Set("AuthToken", session.Values["AuthToken"].(string))
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusOK)
		w.Write(b)
		return
	}

	w.WriteHeader(http.StatusNetworkAuthenticationRequired)
	w.Write([]byte("Error"))
	return
}

func createUser(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if (err != nil) {
		w.WriteHeader(http.StatusBadRequest)
	}

	var user User
	err = json.Unmarshal(body, &user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}

	// TODO Authorize

	db, err := sql.Open("mysql", "root:dinky01@tcp(127.0.0.1:3306)/test")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
	defer db.Close()

	stmt, err := db.Prepare("INSERT USER SET USERNAME=?, PASSWORD=?, USERTYPE = ?, DISPLAY = ?, ENABLED = b'1'")
	if (err != nil) {
		w.WriteHeader(http.StatusInternalServerError)
	}
	defer stmt.Close()

	rows, err := stmt.Exec(user.USERNAME, SHA1Base64Encode([]byte(user.PASSWORD)), user.USERTYPE, user.DISPLAY)

	rows.LastInsertId()

	w.WriteHeader(http.StatusOK)
	return
}

func updateUser(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if (err != nil) {
		w.WriteHeader(http.StatusBadRequest)
	}

	var user User
	err = json.Unmarshal(body, &user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}

	fmt.Println(user.ID)


	// TODO Authorize

	var buf bytes.Buffer
	buf.WriteString("UPDATE USER SET")
	if (user.USERTYPE != "") {
		buf.WriteString(" USERTYPE = ?")
	}
	if (user.DISPLAY != "") {
		buf.WriteString(", DISPLAY = ?")
	}
	buf.WriteString(" ENABLED = b'1'")
	buf.WriteString(" WHERE ID = 2")

	sqlStatement := buf.String()

	fmt.Println(sqlStatement)

	db, err := sql.Open("mysql", "root:dinky01@tcp(127.0.0.1:3306)/test")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
	defer db.Close()

	stmt, err := db.Prepare(sqlStatement)
	if (err != nil) {
		w.WriteHeader(http.StatusInternalServerError)
	}
	defer stmt.Close()

	params := make([]string, 0)

	if (user.USERTYPE != "") {
		params = append(params, user.USERTYPE)
	}
	if (user.DISPLAY != "") {
		params = append(params, user.DISPLAY)
	}

	//params = append(params, string(user.ID))

	rows, err := stmt.Exec(params)
	if (err != nil) {
		w.WriteHeader(http.StatusInternalServerError)
	}

	rows.LastInsertId()

	w.WriteHeader(http.StatusOK)
	return
}

func deleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	key := vars["id"]
	if (key == "") {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("StatusNotFound"))
		return
	}

	// TODO Authorize

	db, err := sql.Open("mysql", "root:dinky01@tcp(127.0.0.1:3306)/test")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
	defer db.Close()

	stmt, err := db.Prepare("DELETE FROM USER WHERE ID = ?")
	if (err != nil) {
		w.WriteHeader(http.StatusInternalServerError)
	}
	defer stmt.Close()

	rows, err := stmt.Exec(key)

	rows.LastInsertId()

	w.WriteHeader(http.StatusOK)
	return
}

func UUID() string {
	type UUID [16]byte
	u := &UUID{}
	_, err := rand.Read(u[:16])
	if err != nil {
		panic(err)
	}
	u[8] = (u[8] | 0x80) & 0xBf
	u[6] = (u[6] | 0x40) & 0x4f
	return fmt.Sprintf("%x-%x-%x-%x-%x", u[:4], u[4:6], u[6:8], u[8:10], u[10:])
}

func main() {
	// Parse flags
	flag.Parse()
	staticDir := flag.Arg(0)

	// Setup static routes
	staticRoutes := make(StaticRoutes, 0)
	if topStaticDir != "" {
		staticRoutes = appendStaticRoute(staticRoutes, topStaticDir)
	}
	if staticDir == "" {
		staticDir = "./"
	}
	staticRoutes = appendStaticRoute(staticRoutes, staticDir)
	staticRoutes = appendStaticRoute(staticRoutes, APP_DIR)
	staticRoutes = appendStaticRoute(staticRoutes, BOWER_DIR)

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/login", login).Methods("POST")
	router.HandleFunc("/rest/user/authenticate", userAuthenticate).Methods("GET")
	router.HandleFunc(`/rest/user/{id:[0-9=\-\/]+}`, deleteUser).Methods("DELETE")
	router.HandleFunc(`/rest/user/{id:[0-9=\-\/]+}`, getUserById).Methods("GET")
	router.HandleFunc(`/rest/user/{username:[a-zA-Z0-9=\-\/]+}`, getUserByUsername).Methods("GET")
	router.HandleFunc("/rest/user", getUsers).Methods("GET")
	router.HandleFunc("/rest/user", createUser).Methods("POST")
	router.HandleFunc("/rest/user", updateUser).Methods("PUT")
	router.PathPrefix("/").Handler(http.FileServer(staticRoutes))

	// Listen on hostname:port
	fmt.Printf("Listening on %s:%d...\n", hostname, port)
	err := http.ListenAndServe(fmt.Sprintf("%s:%d", hostname, port), router)
	if err != nil {
		log.Fatal("Error: ", err)
	}
}

func GetUser(username string) (User, error) {
	var user User
	db, err := sql.Open("mysql", "root:dinky01@tcp(127.0.0.1:3306)/test")
	if err != nil {
		log.Fatal(err)
	}
	stmt, err := db.Prepare("select ID, DISPLAY, PASSWORD, USERTYPE, USERNAME from USER where ENABLED = b'1' and USERNAME = ?")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	rows, err := stmt.Query(username)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	defer db.Close()

	for rows.Next() {
		err := rows.Scan(&user.ID, &user.DISPLAY, &user.PASSWORD, &user.USERTYPE, &user.USERNAME)
		if err != nil {
			log.Fatal(err)
		}
	}
	if err = rows.Err(); err != nil {
		log.Fatal(err)
	}
	if user.USERNAME == "" {
		err = errors.New("not found")
	}
	return user, err
}

func GetUserById(id string) (User, error) {
	var user User
	db, err := sql.Open("mysql", "root:dinky01@tcp(127.0.0.1:3306)/test")
	if err != nil {
		log.Fatal(err)
	}
	stmt, err := db.Prepare("select ID, DISPLAY, USERTYPE, USERNAME from USER where ENABLED = b'1' and ID = ?")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	rows, err := stmt.Query(id)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	defer db.Close()

	for rows.Next() {
		err := rows.Scan(&user.ID, &user.DISPLAY, &user.USERTYPE, &user.USERNAME)
		if err != nil {
			log.Fatal(err)
		}
	}
	if err = rows.Err(); err != nil {
		log.Fatal(err)
	}
	if user.USERNAME == "" {
		err = errors.New("not found")
	}
	return user, err
}

func GetUserByUsername(username string) (User, error) {
	var user User
	db, err := sql.Open("mysql", "root:dinky01@tcp(127.0.0.1:3306)/test")
	if err != nil {
		log.Fatal(err)
	}
	stmt, err := db.Prepare("select ID, DISPLAY, USERTYPE, USERNAME from USER where ENABLED = b'1' and USERNAME = ?")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	rows, err := stmt.Query(username)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	defer db.Close()

	for rows.Next() {
		err := rows.Scan(&user.ID, &user.DISPLAY, &user.USERTYPE, &user.USERNAME)
		if err != nil {
			log.Fatal(err)
		}
	}
	if err = rows.Err(); err != nil {
		log.Fatal(err)
	}
	if user.USERNAME == "" {
		err = errors.New("not found")
	}
	return user, err
}

func GetUsers() ([]User, error) {
	var users []User
	users = make([]User, 0, 1)

	db, err := sql.Open("mysql", "root:dinky01@tcp(127.0.0.1:3306)/test")
	if err != nil {
		log.Fatal(err)
		return users, err
	}
	stmt, err := db.Prepare("select ID, DISPLAY, USERTYPE, USERNAME from USER where USERNAME != 'admin' and ENABLED = b'1'")
	if err != nil {
		log.Fatal(err)
		return users, err
	}
	defer stmt.Close()
	rows, err := stmt.Query()
	if err != nil {
		log.Fatal(err)
		return users, err
	}
	defer rows.Close()
	defer db.Close()

	for rows.Next() {
		var user User
		err := rows.Scan(&user.ID, &user.DISPLAY, &user.USERTYPE, &user.USERNAME)
		if err != nil {
			log.Fatal(err)
			return users, err
		}
		users = append(users, user)
	}
	if err = rows.Err(); err != nil {
		log.Fatal(err)
		return users, err
	}
	return users, err
}

func SHA1Base64Encode(data []byte) string {
	var hasher = sha1.New()
	hasher.Write(data)
	return base64.StdEncoding.EncodeToString(hasher.Sum(nil))
}

func base64Encode(data []byte) string {
	return base64.StdEncoding.EncodeToString(data)
}

func base64Decode(data string) ([]string, error) {
	var b, err = base64.StdEncoding.DecodeString(data)
	return strings.SplitN(string(b), ":", 2), err
}