from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import filters, health, query, venues

app = FastAPI(title="DarkKnight API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(filters.router)
app.include_router(venues.router)
app.include_router(query.router)
