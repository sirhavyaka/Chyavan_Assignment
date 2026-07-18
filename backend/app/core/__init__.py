from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Airbnb Clone"
    SECRET_KEY: str = "airbnb-clone-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    DATABASE_URL: str = "sqlite:///./airbnb.db"
    CORS_ORIGINS: list[str] = ["https://chyavan-airbnb-clone.vercel.app", "http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
