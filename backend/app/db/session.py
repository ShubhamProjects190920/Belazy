"""
Database Session Management
Creates the SQLAlchemy engine and session factory.
get_db() is used as a FastAPI dependency in every route that needs the database.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

# The engine is the low-level connection to PostgreSQL
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # verify connections before using them
    pool_size=10,          # keep 10 connections open
    max_overflow=20,       # allow up to 20 extra connections under load
)

# SessionLocal is a factory that creates new database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session per request.
    The session is automatically closed when the request is done.
    Usage in a route: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
