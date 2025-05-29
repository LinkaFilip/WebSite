from fastapi import FastAPI
from sqlalchemy import create_engine

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String

app = FastAPI()

SQLALCHEMY_DATABASE_URL = "postgresql://uzivatel:heslo@db:5432/mojedb"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI + PostgreSQL"}

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    Base.metadata.create_all(bind=engine)

    from fastapi import Request

@app.post("/users/")
def create_user(name: str):
    with engine.connect() as connection:
        connection.execute(
            f"INSERT INTO users (name) VALUES ('{name}')"
        )
    return {"status": "user created"}
