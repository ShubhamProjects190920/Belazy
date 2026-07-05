"""
Token Schemas
Pydantic models define the exact shape of JSON data sent to/from the API.
These schemas are for the authentication tokens.
"""
from pydantic import BaseModel


class Token(BaseModel):
    """Returned to the client after a successful login."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """The decoded contents of a JWT token."""
    sub: str   # subject — the user's ID
    type: str  # "access" or "refresh"


class RefreshTokenRequest(BaseModel):
    """Body sent to /auth/refresh to get a new access token."""
    refresh_token: str
