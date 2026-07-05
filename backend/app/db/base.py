"""
SQLAlchemy Declarative Base
All database models must inherit from this Base class.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
