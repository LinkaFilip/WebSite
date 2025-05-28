use axum::{
    routing::{get, post},
    Router,
    http::StatusCode,
    extract::Form,
    response::Html,
};
use std::net::SocketAddr;
use serde::Deserialize;

#[derive(Deserialize)]
struct LoginForm {
    password: String,
}

async fn login_form() -> Html<&'static str> {
    Html(r#"
        <form action="/admin-login" method="post">
            <input type="password" name="password" placeholder="Enter password" />
            <button type="submit">Login</button>
        </form>
    "#)
}

async fn handle_login(Form(input): Form<LoginForm>) -> StatusCode {
    if input.password == "supersecret" {
        StatusCode::OK
    } else {
        StatusCode::UNAUTHORIZED
    }
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/admin-login", get(login_form).post(handle_login));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on http://{}", addr);
    hyper::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}