from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / '.env')

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated

import bcrypt
import jwt
import secrets as _secrets
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator, EmailStr

# ─── Config ───────────────────────────────────────────────────────────────────
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# ─── MongoDB ──────────────────────────────────────────────────────────────────
client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

# ─── Helpers ──────────────────────────────────────────────────────────────────
def PyObjectId(v):
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str) and ObjectId.is_valid(v):
        return v
    raise ValueError(f"ObjectId non valido: {v}")

def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(user_id: str, email: str, role: str) -> str:
    return jwt.encode(
        {"sub": user_id, "email": email, "role": role,
         "exp": datetime.now(timezone.utc) + timedelta(hours=8), "type": "access"},
        JWT_SECRET, algorithm=JWT_ALGORITHM
    )

def create_refresh_token(user_id: str) -> str:
    return jwt.encode(
        {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"},
        JWT_SECRET, algorithm=JWT_ALGORITHM
    )

def generate_otp() -> str:
    return str(_secrets.randbelow(900000) + 100000)

def validate_codice_fiscale(cf: str) -> bool:
    cf = cf.upper().strip()
    if len(cf) != 16:
        return False
    allowed = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
    if not all(c in allowed for c in cf):
        return False
    odd = {'0':1,'1':0,'2':5,'3':7,'4':9,'5':13,'6':15,'7':17,'8':19,'9':21,
           'A':1,'B':0,'C':5,'D':7,'E':9,'F':13,'G':15,'H':17,'I':19,'J':21,
           'K':2,'L':4,'M':18,'N':20,'O':11,'P':3,'Q':6,'R':8,'S':12,'T':14,
           'U':16,'V':10,'W':22,'X':25,'Y':24,'Z':23}
    even = {'0':0,'1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,
            'A':0,'B':1,'C':2,'D':3,'E':4,'F':5,'G':6,'H':7,'I':8,'J':9,
            'K':10,'L':11,'M':12,'N':13,'O':14,'P':15,'Q':16,'R':17,'S':18,
            'T':19,'U':20,'V':21,'W':22,'X':23,'Y':24,'Z':25}
    total = sum(odd.get(c, 0) if i % 2 == 0 else even.get(c, 0) for i, c in enumerate(cf[:-1]))
    return cf[-1] == chr(ord('A') + (total % 26))

# ─── Auth dependency ──────────────────────────────────────────────────────────
async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Non autenticato")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token non valido")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Utente non trovato")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessione scaduta")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token non valido")

async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accesso riservato agli amministratori")
    return user

async def require_auth(user: dict = Depends(get_current_user)):
    return user

# ─── Pydantic models ──────────────────────────────────────────────────────────
class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    nome: str
    cognome: str
    role: str = "paziente"
    consenso_privacy: bool = True

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class OTPInput(BaseModel):
    email: EmailStr
    otp_code: str

class FormazioneItem(BaseModel):
    titolo: str
    istituto: str
    anno: Optional[int] = None

class DisponibilitaItem(BaseModel):
    giorno: str
    ora_inizio: str
    ora_fine: str

class TerapistaProfileInput(BaseModel):
    nome: Optional[str] = None
    cognome: Optional[str] = None
    telefono: Optional[str] = None
    bio: Optional[str] = None
    anni_esperienza: Optional[int] = None
    specializzazioni: Optional[List[str]] = []
    formazione: Optional[List[FormazioneItem]] = []
    approccio_terapeutico: Optional[str] = None
    genere: Optional[str] = None
    albo_numero: Optional[str] = None
    albo_ordine: Optional[str] = None
    albo_iscrizione_data: Optional[str] = None
    assicurazione_compagnia: Optional[str] = None
    assicurazione_numero_polizza: Optional[str] = None
    assicurazione_scadenza: Optional[str] = None
    prezzo_sessione: Optional[float] = None
    lingue: Optional[List[str]] = []
    disponibilita: Optional[List[DisponibilitaItem]] = []

class PazienteProfileInput(BaseModel):
    nome: Optional[str] = None
    cognome: Optional[str] = None
    data_nascita: Optional[str] = None
    genere: Optional[str] = None
    codice_fiscale: Optional[str] = None
    telefono: Optional[str] = None
    indirizzo: Optional[str] = None
    citta: Optional[str] = None
    cap: Optional[str] = None
    note_cliniche: Optional[str] = None
    terapeuta_assegnato: Optional[str] = None

class AppuntamentoInput(BaseModel):
    terapeuta_id: str
    paziente_id: str
    data_ora: str
    durata_minuti: int = 50
    tipo: str = "online"
    note: Optional[str] = None

class AppuntamentoStatoInput(BaseModel):
    stato: str

class ArticoloInput(BaseModel):
    titolo: str
    contenuto: str
    categoria: Optional[str] = None
    tags: Optional[List[str]] = []
    immagine_url: Optional[str] = None

# ─── FastAPI setup ────────────────────────────────────────────────────────────
app = FastAPI(title="FunzionaBene API")
api_router = APIRouter(prefix="/api")

# ─── AUTH ROUTES ─────────────────────────────────────────────────────────────
@api_router.post("/auth/register")
async def register(data: RegisterInput, response: Response):
    email = data.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email già registrata")
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password deve avere almeno 8 caratteri")
    if data.role not in ["paziente", "terapeuta"]:
        raise HTTPException(status_code=400, detail="Ruolo non valido")

    otp_code = generate_otp()
    otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)

    user_doc = {
        "email": email,
        "password_hash": hash_password(data.password),
        "nome": data.nome,
        "cognome": data.cognome,
        "role": data.role,
        "is_verified": False,
        "is_active": True,
        "otp_code": otp_code,
        "otp_expires": otp_expires,
        "consenso_privacy": data.consenso_privacy,
        "created_at": datetime.now(timezone.utc)
    }
    if data.role == "terapeuta":
        user_doc["approval_status"] = "pending"

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Create empty profile
    if data.role == "paziente":
        await db.pazienti.insert_one({
            "user_id": user_id, "nome": data.nome, "cognome": data.cognome,
            "created_at": datetime.now(timezone.utc)
        })
    else:
        await db.terapisti.insert_one({
            "user_id": user_id, "nome": data.nome, "cognome": data.cognome,
            "autocertificazione_firmata": False,
            "created_at": datetime.now(timezone.utc)
        })

    logging.info(f"[OTP] {email}: {otp_code}")
    return {"message": "Registrazione completata. Controlla la tua email per il codice OTP.", "otp_dev": otp_code}

@api_router.post("/auth/verify-otp")
async def verify_otp(data: OTPInput, response: Response):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    if user.get("is_verified"):
        raise HTTPException(status_code=400, detail="Account già verificato")
    otp_expires = user.get("otp_expires")
    if otp_expires:
        if isinstance(otp_expires, str):
            otp_expires = datetime.fromisoformat(otp_expires)
        if otp_expires.tzinfo is None:
            otp_expires = otp_expires.replace(tzinfo=timezone.utc)
    if not otp_expires or datetime.now(timezone.utc) > otp_expires:
        raise HTTPException(status_code=400, detail="Codice OTP scaduto")
    if user.get("otp_code") != data.otp_code:
        raise HTTPException(status_code=400, detail="Codice OTP non valido")

    await db.users.update_one({"_id": user["_id"]}, {"$set": {"is_verified": True, "otp_code": None}})
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email, user["role"])
    refresh_token = create_refresh_token(user_id)
    response.set_cookie("access_token", access_token, httponly=True, samesite="none", secure=True, max_age=28800, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="none", secure=True, max_age=604800, path="/")
    return {"message": "Account verificato con successo", "role": user["role"], "nome": user["nome"]}

@api_router.post("/auth/resend-otp")
async def resend_otp(body: dict):
    email = body.get("email", "").lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    otp_code = generate_otp()
    otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"otp_code": otp_code, "otp_expires": otp_expires}})
    logging.info(f"[OTP Resend] {email}: {otp_code}")
    return {"message": "Nuovo codice OTP inviato", "otp_dev": otp_code}

@api_router.post("/auth/login")
async def login(data: LoginInput, response: Response):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenziali non valide")
    if not user.get("is_verified") and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Account non verificato. Controlla la tua email per il codice OTP.")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account disattivato")

    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email, user["role"])
    refresh_token = create_refresh_token(user_id)
    response.set_cookie("access_token", access_token, httponly=True, samesite="none", secure=True, max_age=28800, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="none", secure=True, max_age=604800, path="/")
    return {"_id": user_id, "email": email, "nome": user["nome"], "cognome": user["cognome"], "role": user["role"]}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logout effettuato con successo"}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

# ─── TERAPISTI ────────────────────────────────────────────────────────────────
@api_router.get("/terapisti")
async def list_terapisti(user: dict = Depends(require_auth)):
    query = {} if user["role"] == "admin" else {"user_id": user["_id"]}
    docs = await db.terapisti.find(query).to_list(200)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

@api_router.get("/terapisti/{terapista_id}")
async def get_terapista(terapista_id: str, user: dict = Depends(require_auth)):
    doc = await db.terapisti.find_one({"_id": ObjectId(terapista_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Terapeuta non trovato")
    doc["_id"] = str(doc["_id"])
    return doc

@api_router.post("/terapisti")
async def create_terapista(data: TerapistaProfileInput, user: dict = Depends(require_admin)):
    doc = data.model_dump(exclude_none=True)
    doc["created_at"] = datetime.now(timezone.utc)
    doc["autocertificazione_firmata"] = False
    result = await db.terapisti.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

@api_router.put("/terapisti/{terapista_id}")
async def update_terapista(terapista_id: str, data: TerapistaProfileInput, user: dict = Depends(require_auth)):
    existing = await db.terapisti.find_one({"_id": ObjectId(terapista_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Terapeuta non trovato")
    if user["role"] != "admin" and existing.get("user_id") != user["_id"]:
        raise HTTPException(status_code=403, detail="Accesso negato")
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc)
    await db.terapisti.update_one({"_id": ObjectId(terapista_id)}, {"$set": update})
    doc = await db.terapisti.find_one({"_id": ObjectId(terapista_id)})
    doc["_id"] = str(doc["_id"])
    return doc

@api_router.delete("/terapisti/{terapista_id}")
async def delete_terapista(terapista_id: str, user: dict = Depends(require_admin)):
    result = await db.terapisti.delete_one({"_id": ObjectId(terapista_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Terapeuta non trovato")
    return {"message": "Terapeuta eliminato"}

@api_router.post("/terapisti/{terapista_id}/autocertificazione")
async def firma_autocertificazione(terapista_id: str, request: Request, user: dict = Depends(require_auth)):
    doc = await db.terapisti.find_one({"_id": ObjectId(terapista_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Terapeuta non trovato")
    if user["role"] != "admin" and doc.get("user_id") != user["_id"]:
        raise HTTPException(status_code=403, detail="Accesso negato")
    client_ip = request.client.host if request.client else "unknown"
    await db.terapisti.update_one(
        {"_id": ObjectId(terapista_id)},
        {"$set": {
            "autocertificazione_firmata": True,
            "autocertificazione_data": datetime.now(timezone.utc),
            "autocertificazione_ip": client_ip
        }}
    )
    return {"message": "Autocertificazione firmata con successo", "data": datetime.now(timezone.utc).isoformat()}

@api_router.get("/terapisti/profilo/me")
async def get_my_terapista_profile(user: dict = Depends(require_auth)):
    if user["role"] not in ["terapeuta", "admin"]:
        raise HTTPException(status_code=403, detail="Accesso negato")
    doc = await db.terapisti.find_one({"user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Profilo non trovato")
    doc["_id"] = str(doc["_id"])
    return doc

@api_router.put("/terapisti/profilo/me")
async def update_my_terapista_profile(data: TerapistaProfileInput, user: dict = Depends(require_auth)):
    if user["role"] not in ["terapeuta", "admin"]:
        raise HTTPException(status_code=403, detail="Accesso negato")
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc)
    result = await db.terapisti.update_one({"user_id": user["_id"]}, {"$set": update}, upsert=True)
    doc = await db.terapisti.find_one({"user_id": user["_id"]})
    doc["_id"] = str(doc["_id"])
    return doc

# ─── PAZIENTI ─────────────────────────────────────────────────────────────────
@api_router.get("/pazienti")
async def list_pazienti(user: dict = Depends(require_auth)):
    docs: list = []
    if user["role"] == "admin":
        docs = await db.pazienti.find({}).to_list(500)
    elif user["role"] == "terapeuta":
        terapista = await db.terapisti.find_one({"user_id": user["_id"]})
        tid = str(terapista["_id"]) if terapista else None
        docs = await db.pazienti.find({"terapeuta_assegnato": tid}).to_list(200)
    else:
        docs = await db.pazienti.find({"user_id": user["_id"]}).to_list(1)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

@api_router.get("/pazienti/{paziente_id}")
async def get_paziente(paziente_id: str, user: dict = Depends(require_auth)):
    doc = await db.pazienti.find_one({"_id": ObjectId(paziente_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Paziente non trovato")
    doc["_id"] = str(doc["_id"])
    return doc

@api_router.post("/pazienti")
async def create_paziente(data: PazienteProfileInput, user: dict = Depends(require_admin)):
    if data.codice_fiscale and not validate_codice_fiscale(data.codice_fiscale):
        raise HTTPException(status_code=400, detail="Codice Fiscale non valido")
    doc = data.model_dump(exclude_none=True)
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.pazienti.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

@api_router.put("/pazienti/{paziente_id}")
async def update_paziente(paziente_id: str, data: PazienteProfileInput, user: dict = Depends(require_auth)):
    existing = await db.pazienti.find_one({"_id": ObjectId(paziente_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Paziente non trovato")
    if data.codice_fiscale and not validate_codice_fiscale(data.codice_fiscale):
        raise HTTPException(status_code=400, detail="Codice Fiscale non valido")
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc)
    await db.pazienti.update_one({"_id": ObjectId(paziente_id)}, {"$set": update})
    doc = await db.pazienti.find_one({"_id": ObjectId(paziente_id)})
    doc["_id"] = str(doc["_id"])
    return doc

@api_router.delete("/pazienti/{paziente_id}")
async def delete_paziente(paziente_id: str, user: dict = Depends(require_admin)):
    result = await db.pazienti.delete_one({"_id": ObjectId(paziente_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Paziente non trovato")
    return {"message": "Paziente eliminato"}

@api_router.get("/pazienti/profilo/me")
async def get_my_paziente_profile(user: dict = Depends(require_auth)):
    if user["role"] != "paziente":
        raise HTTPException(status_code=403, detail="Accesso negato")
    doc = await db.pazienti.find_one({"user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Profilo non trovato")
    doc["_id"] = str(doc["_id"])
    return doc

@api_router.put("/pazienti/profilo/me")
async def update_my_paziente_profile(data: PazienteProfileInput, user: dict = Depends(require_auth)):
    if user["role"] != "paziente":
        raise HTTPException(status_code=403, detail="Accesso negato")
    if data.codice_fiscale and not validate_codice_fiscale(data.codice_fiscale):
        raise HTTPException(status_code=400, detail="Codice Fiscale non valido")
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc)
    await db.pazienti.update_one({"user_id": user["_id"]}, {"$set": update}, upsert=True)
    doc = await db.pazienti.find_one({"user_id": user["_id"]})
    doc["_id"] = str(doc["_id"])
    return doc

# ─── APPUNTAMENTI ─────────────────────────────────────────────────────────────
@api_router.get("/appuntamenti")
async def list_appuntamenti(user: dict = Depends(require_auth)):
    docs: list = []
    if user["role"] == "admin":
        docs = await db.appuntamenti.find({}).sort("data_ora", -1).to_list(500)
    elif user["role"] == "terapeuta":
        terapista = await db.terapisti.find_one({"user_id": user["_id"]})
        tid = str(terapista["_id"]) if terapista else None
        docs = await db.appuntamenti.find({"terapeuta_id": tid}).sort("data_ora", -1).to_list(200)
    else:
        paziente = await db.pazienti.find_one({"user_id": user["_id"]})
        pid = str(paziente["_id"]) if paziente else None
        docs = await db.appuntamenti.find({"paziente_id": pid}).sort("data_ora", -1).to_list(100)
    for d in docs:
        d["_id"] = str(d["_id"])
        # Enrich with names
        if d.get("terapeuta_id"):
            try:
                t = await db.terapisti.find_one({"_id": ObjectId(d["terapeuta_id"])})
                if t:
                    d["terapeuta_nome"] = f"{t.get('nome','')} {t.get('cognome','')}".strip()
            except:
                pass
        if d.get("paziente_id"):
            try:
                p = await db.pazienti.find_one({"_id": ObjectId(d["paziente_id"])})
                if p:
                    d["paziente_nome"] = f"{p.get('nome','')} {p.get('cognome','')}".strip()
            except:
                pass
    return docs

@api_router.post("/appuntamenti")
async def create_appuntamento(data: AppuntamentoInput, user: dict = Depends(require_auth)):
    doc = data.model_dump()
    doc["stato"] = "prenotato"
    doc["created_at"] = datetime.now(timezone.utc)
    doc["created_by"] = user["_id"]
    result = await db.appuntamenti.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

@api_router.put("/appuntamenti/{app_id}")
async def update_appuntamento(app_id: str, data: AppuntamentoInput, user: dict = Depends(require_auth)):
    update = data.model_dump(exclude_none=True)
    update["updated_at"] = datetime.now(timezone.utc)
    await db.appuntamenti.update_one({"_id": ObjectId(app_id)}, {"$set": update})
    doc = await db.appuntamenti.find_one({"_id": ObjectId(app_id)})
    doc["_id"] = str(doc["_id"])
    return doc

@api_router.patch("/appuntamenti/{app_id}/stato")
async def update_stato_appuntamento(app_id: str, data: AppuntamentoStatoInput, user: dict = Depends(require_auth)):
    valid_stati = ["prenotato", "confermato", "completato", "cancellato"]
    if data.stato not in valid_stati:
        raise HTTPException(status_code=400, detail=f"Stato non valido. Usa: {valid_stati}")
    await db.appuntamenti.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"stato": data.stato, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": f"Stato aggiornato a: {data.stato}"}

@api_router.delete("/appuntamenti/{app_id}")
async def delete_appuntamento(app_id: str, user: dict = Depends(require_admin)):
    await db.appuntamenti.delete_one({"_id": ObjectId(app_id)})
    return {"message": "Appuntamento eliminato"}

# ─── BLOG ─────────────────────────────────────────────────────────────────────
@api_router.get("/blog")
async def list_articoli(user: dict = Depends(require_auth)):
    if user["role"] == "terapeuta":
        docs = await db.articoli.find({"autore_id": user["_id"]}).sort("created_at", -1).to_list(100)
    else:
        docs = await db.articoli.find({}).sort("created_at", -1).to_list(100)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

@api_router.post("/blog")
async def create_articolo(data: ArticoloInput, user: dict = Depends(require_auth)):
    if user["role"] not in ["terapeuta", "admin"]:
        raise HTTPException(status_code=403, detail="Accesso negato")
    doc = data.model_dump()
    doc["autore_id"] = user["_id"]
    doc["autore_nome"] = f"{user.get('nome','')} {user.get('cognome','')}".strip()
    doc["stato"] = "bozza" if user["role"] == "terapeuta" else "pubblicato"
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.articoli.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

@api_router.put("/blog/{art_id}")
async def update_articolo(art_id: str, data: ArticoloInput, user: dict = Depends(require_auth)):
    doc = await db.articoli.find_one({"_id": ObjectId(art_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Articolo non trovato")
    if user["role"] != "admin" and doc.get("autore_id") != user["_id"]:
        raise HTTPException(status_code=403, detail="Accesso negato")
    update = data.model_dump(exclude_none=True)
    update["updated_at"] = datetime.now(timezone.utc)
    await db.articoli.update_one({"_id": ObjectId(art_id)}, {"$set": update})
    doc = await db.articoli.find_one({"_id": ObjectId(art_id)})
    doc["_id"] = str(doc["_id"])
    return doc

@api_router.patch("/blog/{art_id}/approva")
async def approva_articolo(art_id: str, user: dict = Depends(require_admin)):
    await db.articoli.update_one(
        {"_id": ObjectId(art_id)},
        {"$set": {"stato": "pubblicato", "approvato_da": user["_id"], "approvato_il": datetime.now(timezone.utc)}}
    )
    return {"message": "Articolo approvato e pubblicato"}

@api_router.patch("/blog/{art_id}/rifiuta")
async def rifiuta_articolo(art_id: str, user: dict = Depends(require_admin)):
    await db.articoli.update_one(
        {"_id": ObjectId(art_id)},
        {"$set": {"stato": "rifiutato", "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Articolo rifiutato"}

@api_router.delete("/blog/{art_id}")
async def delete_articolo(art_id: str, user: dict = Depends(require_auth)):
    doc = await db.articoli.find_one({"_id": ObjectId(art_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Articolo non trovato")
    if user["role"] != "admin" and doc.get("autore_id") != user["_id"]:
        raise HTTPException(status_code=403, detail="Accesso negato")
    await db.articoli.delete_one({"_id": ObjectId(art_id)})
    return {"message": "Articolo eliminato"}

# ─── SLOT DISPONIBILITÀ ──────────────────────────────────────────────────────
GIORNI_IT = {"Lunedì":0,"Martedì":1,"Mercoledì":2,"Giovedì":3,"Venerdì":4,"Sabato":5,"Domenica":6}
GIORNI_IT_INV = {v: k for k, v in GIORNI_IT.items()}

def fmt_slot_it(dt: datetime) -> str:
    giorno = GIORNI_IT_INV.get(dt.weekday(), "")
    return f"{giorno} {dt.strftime('%d/%m/%Y %H:%M')}"

@api_router.get("/terapisti/{terapista_id}/slots")
async def get_slots(terapista_id: str, data_inizio: str = None, settimane: int = 2):
    terapista = await db.terapisti.find_one({"_id": ObjectId(terapista_id)})
    if not terapista:
        raise HTTPException(status_code=404, detail="Terapeuta non trovato")

    disponibilita = terapista.get("disponibilita", [])
    durata = 50  # minuti per slot

    now = datetime.now(timezone.utc)
    if data_inizio:
        try:
            start = datetime.fromisoformat(data_inizio).replace(tzinfo=timezone.utc, hour=0, minute=0, second=0, microsecond=0)
        except Exception:
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    end = start + timedelta(weeks=max(1, min(settimane, 8)))

    # Appuntamenti esistenti (non cancellati)
    existing = await db.appuntamenti.find({
        "terapeuta_id": terapista_id,
        "stato": {"$nin": ["cancellato"]},
        "data_ora": {"$gte": start.isoformat(), "$lt": end.isoformat()}
    }).to_list(500)
    booked = {a["data_ora"][:16] for a in existing}  # YYYY-MM-DDTHH:MM

    slots = []
    current_day = start
    while current_day < end:
        wd = current_day.weekday()
        for disp in disponibilita:
            if GIORNI_IT.get(disp.get("giorno",""), -1) != wd:
                continue
            try:
                h0, m0 = map(int, disp["ora_inizio"].split(":"))
                h1, m1 = map(int, disp["ora_fine"].split(":"))
            except Exception:
                continue
            slot_t = current_day.replace(hour=h0, minute=m0, second=0, microsecond=0)
            end_t  = current_day.replace(hour=h1, minute=m1, second=0, microsecond=0)
            while slot_t + timedelta(minutes=durata) <= end_t:
                if slot_t > now:
                    key = slot_t.isoformat()[:16]
                    slots.append({
                        "data_ora": slot_t.isoformat(),
                        "data_ora_fmt": fmt_slot_it(slot_t),
                        "disponibile": key not in booked
                    })
                slot_t += timedelta(minutes=durata)
        current_day += timedelta(days=1)

    return {"slots": slots, "terapeuta_id": terapista_id, "durata_minuti": durata}

# ─── ADMIN USER MANAGEMENT ───────────────────────────────────────────────────
@api_router.get("/admin/utenti")
async def list_utenti(user: dict = Depends(require_admin)):
    docs = await db.users.find({}, {"password_hash": 0, "otp_code": 0}).to_list(500)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

@api_router.patch("/admin/utenti/{user_id}/stato")
async def toggle_user_stato(user_id: str, body: dict, user: dict = Depends(require_admin)):
    is_active = body.get("is_active", True)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": is_active}})
    return {"message": "Stato utente aggiornato"}

@api_router.patch("/admin/terapisti/{terapista_user_id}/approva")
async def approva_terapista(terapista_user_id: str, user: dict = Depends(require_admin)):
    await db.users.update_one(
        {"_id": ObjectId(terapista_user_id)},
        {"$set": {"approval_status": "approvato", "is_verified": True}}
    )
    return {"message": "Terapeuta approvato"}

# ─── DASHBOARD ────────────────────────────────────────────────────────────────
@api_router.get("/dashboard/stats")
async def dashboard_stats(user: dict = Depends(require_auth)):
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    n_terapisti = await db.terapisti.count_documents({})
    n_pazienti = await db.pazienti.count_documents({})
    n_appuntamenti_oggi = await db.appuntamenti.count_documents({
        "data_ora": {"$gte": today.isoformat(), "$lt": (today + timedelta(days=1)).isoformat()}
    })
    n_appuntamenti_totali = await db.appuntamenti.count_documents({})
    n_terapisti_pendenti = await db.users.count_documents({"role": "terapeuta", "approval_status": "pending"})
    n_articoli_bozza = await db.articoli.count_documents({"stato": "bozza"})
    n_terapisti_senza_cert = await db.terapisti.count_documents({"autocertificazione_firmata": False})

    scadenze = []
    terapisti_docs = await db.terapisti.find({"assicurazione_scadenza": {"$exists": True}}).to_list(100)
    for t in terapisti_docs:
        scad = t.get("assicurazione_scadenza")
        if scad:
            try:
                scad_date = datetime.fromisoformat(scad.replace("Z", "+00:00"))
                giorni = (scad_date - datetime.now(timezone.utc)).days
                if giorni <= 60:
                    scadenze.append({
                        "terapeuta": f"{t.get('nome','')} {t.get('cognome','')}".strip(),
                        "scadenza": scad,
                        "giorni_rimanenti": giorni
                    })
            except:
                pass

    return {
        "terapisti": n_terapisti,
        "pazienti": n_pazienti,
        "appuntamenti_oggi": n_appuntamenti_oggi,
        "appuntamenti_totali": n_appuntamenti_totali,
        "terapisti_pendenti": n_terapisti_pendenti,
        "articoli_in_revisione": n_articoli_bozza,
        "terapisti_senza_autocertificazione": n_terapisti_senza_cert,
        "scadenze_assicurazione": scadenze
    }

class MatchingInput(BaseModel):
    eta: Optional[str] = None
    genere: Optional[str] = None
    problemi: Optional[List[str]] = []
    orari: Optional[List[str]] = []
    preferenza_terapeuta: Optional[str] = None

class MessaggioInput(BaseModel):
    destinatario_id: str
    testo: str

class FAQInput(BaseModel):
    domanda: str
    risposta: str
    ordine: Optional[int] = 0

# ─── PUBLIC ROUTES (no auth) ──────────────────────────────────────────────────
@api_router.get("/public/terapisti")
async def public_list_terapisti():
    docs = await db.terapisti.find({"autocertificazione_firmata": True}).to_list(100)
    for d in docs:
        d["_id"] = str(d["_id"])
        d.pop("note_cliniche", None)
    return docs

@api_router.get("/public/terapisti/{tid}")
async def public_get_terapista(tid: str):
    doc = await db.terapisti.find_one({"_id": ObjectId(tid)})
    if not doc:
        raise HTTPException(status_code=404, detail="Terapeuta non trovato")
    doc["_id"] = str(doc["_id"])
    return doc

@api_router.post("/public/matching")
async def matching(data: MatchingInput):
    docs = await db.terapisti.find({"autocertificazione_firmata": True}).to_list(100)
    PREF_MAP = {"Preferisco una donna": "F", "Preferisco un uomo": "M"}
    pref_genere = PREF_MAP.get(data.preferenza_terapeuta or "", None)
    ORARIO_MAP = {"Mattina (8-12)": (8,12), "Pomeriggio (12-18)": (12,18), "Sera (18-21)": (18,21)}

    results = []
    for t in docs:
        score = 0
        reasons = []
        # Genere
        if pref_genere:
            if t.get("genere") == pref_genere:
                score += 30; reasons.append("Preferenza di genere")
        else:
            score += 15
        # Specializzazioni
        for prob in (data.problemi or []):
            for spec in t.get("specializzazioni", []):
                if any(w in spec.lower() for w in prob.lower().split()):
                    score += 20; reasons.append(f"Specializzazione: {spec}"); break
        # Disponibilità × orari
        for disp in t.get("disponibilita", []):
            is_wkend = disp.get("giorno","") in ["Sabato","Domenica"]
            if "Weekend" in (data.orari or []) and is_wkend:
                score += 10
            elif "Weekend" not in (data.orari or []) and not is_wkend:
                score += 5
            try:
                h = int(disp.get("ora_inizio","0:0").split(":")[0])
                for orario in (data.orari or []):
                    rng = ORARIO_MAP.get(orario)
                    if rng and rng[0] <= h < rng[1]:
                        score += 10
            except Exception:
                pass
        t["_id"] = str(t["_id"])
        t["match_score"] = score
        t["match_reasons"] = list(set(reasons))
        results.append(t)
    results.sort(key=lambda x: x["match_score"], reverse=True)
    top = results[:3]
    # Normalize to percent
    max_s = top[0]["match_score"] if top else 1
    for t in top:
        t["compatibilita"] = min(99, max(70, int(t["match_score"] / max(max_s, 1) * 99)))
    return {"terapisti": top}

@api_router.get("/public/blog")
async def public_blog():
    docs = await db.articoli.find({"stato": "pubblicato"}).sort("created_at", -1).to_list(50)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

@api_router.get("/public/faq")
async def public_faq():
    docs = await db.faq.find({}).sort("ordine", 1).to_list(50)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

# ─── FAQ ADMIN ────────────────────────────────────────────────────────────────
@api_router.post("/faq")
async def create_faq(data: FAQInput, user: dict = Depends(require_admin)):
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.faq.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

@api_router.put("/faq/{faq_id}")
async def update_faq(faq_id: str, data: FAQInput, user: dict = Depends(require_admin)):
    await db.faq.update_one({"_id": ObjectId(faq_id)}, {"$set": data.model_dump()})
    doc = await db.faq.find_one({"_id": ObjectId(faq_id)})
    doc["_id"] = str(doc["_id"])
    return doc

@api_router.delete("/faq/{faq_id}")
async def delete_faq(faq_id: str, user: dict = Depends(require_admin)):
    await db.faq.delete_one({"_id": ObjectId(faq_id)})
    return {"message": "FAQ eliminata"}

# ─── MESSAGGI ─────────────────────────────────────────────────────────────────
@api_router.get("/conversazioni")
async def list_conversazioni(user: dict = Depends(require_auth)):
    uid = user["_id"]
    if user["role"] == "paziente":
        paziente = await db.pazienti.find_one({"user_id": uid})
        if not paziente:
            return []
        pid = str(paziente["_id"])
        apps = await db.appuntamenti.find({"paziente_id": pid, "stato": {"$in": ["confermato","completato"]}}).to_list(100)
        tids = list({a["terapeuta_id"] for a in apps})
        convs = []
        for tid in tids:
            t = await db.terapisti.find_one({"_id": ObjectId(tid)})
            if t:
                conv_id = f"{pid}_{tid}"
                last = await db.messaggi.find_one({"conversazione_id": conv_id}, sort=[("created_at", -1)])
                unread = await db.messaggi.count_documents({"conversazione_id": conv_id, "mittente_id": {"$ne": uid}, "letto": False})
                convs.append({"conversazione_id": conv_id, "terapeuta_id": tid, "terapeuta_nome": f"{t.get('nome','')} {t.get('cognome','')}".strip(), "ultimo_messaggio": last["testo"] if last else None, "non_letti": unread})
        return convs
    else:
        terapista = await db.terapisti.find_one({"user_id": uid})
        if not terapista:
            return []
        tid = str(terapista["_id"])
        apps = await db.appuntamenti.find({"terapeuta_id": tid, "stato": {"$in": ["confermato","completato"]}}).to_list(100)
        pids = list({a["paziente_id"] for a in apps})
        convs = []
        for pid in pids:
            p = await db.pazienti.find_one({"_id": ObjectId(pid)})
            if p:
                conv_id = f"{pid}_{tid}"
                last = await db.messaggi.find_one({"conversazione_id": conv_id}, sort=[("created_at", -1)])
                unread = await db.messaggi.count_documents({"conversazione_id": conv_id, "mittente_id": {"$ne": uid}, "letto": False})
                convs.append({"conversazione_id": conv_id, "paziente_id": pid, "paziente_nome": f"{p.get('nome','')} {p.get('cognome','')}".strip(), "ultimo_messaggio": last["testo"] if last else None, "non_letti": unread})
        return convs

@api_router.get("/messaggi/{conv_id}")
async def get_messaggi(conv_id: str, user: dict = Depends(require_auth)):
    docs = await db.messaggi.find({"conversazione_id": conv_id}).sort("created_at", 1).to_list(200)
    await db.messaggi.update_many({"conversazione_id": conv_id, "mittente_id": {"$ne": user["_id"]}}, {"$set": {"letto": True}})
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

@api_router.post("/messaggi")
async def send_messaggio(data: MessaggioInput, user: dict = Depends(require_auth)):
    uid = user["_id"]
    if user["role"] == "paziente":
        paziente = await db.pazienti.find_one({"user_id": uid})
        if not paziente:
            raise HTTPException(400, "Profilo paziente non trovato")
        pid = str(paziente["_id"])
        tid = data.destinatario_id
        conv_id = f"{pid}_{tid}"
    else:
        terapista = await db.terapisti.find_one({"user_id": uid})
        if not terapista:
            raise HTTPException(400, "Profilo terapeuta non trovato")
        tid = str(terapista["_id"])
        pid = data.destinatario_id
        conv_id = f"{pid}_{tid}"
    doc = {"conversazione_id": conv_id, "mittente_id": uid, "mittente_ruolo": user["role"], "testo": data.testo, "letto": False, "created_at": datetime.now(timezone.utc)}
    result = await db.messaggi.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

# ─── PRENOTAZIONE PUBBLICA ────────────────────────────────────────────────────
@api_router.post("/public/prenota")
async def prenota_pubblico(data: AppuntamentoInput, user: dict = Depends(require_auth)):
    if user["role"] != "paziente":
        raise HTTPException(403, "Solo i pazienti possono prenotare")
    doc = data.model_dump()
    doc["stato"] = "prenotato"
    doc["created_at"] = datetime.now(timezone.utc)
    doc["paziente_user_id"] = user["_id"]
    result = await db.appuntamenti.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Startup ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await seed_data()

async def seed_data():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@funzionabene.it")
    admin_pwd = os.environ.get("ADMIN_PASSWORD", "Admin#2024!")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_pwd),
            "nome": "Amministratore",
            "cognome": "FunzionaBene",
            "role": "admin",
            "is_verified": True,
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        })
        logging.info(f"[SEED] Admin creato: {admin_email}")

    # Seed demo therapist
    demo_email = "demo.terapeuta@funzionabene.it"
    demo_user = await db.users.find_one({"email": demo_email})
    if not demo_user:
        result = await db.users.insert_one({
            "email": demo_email,
            "password_hash": hash_password("Terapeuta#2024!"),
            "nome": "Maria",
            "cognome": "Rossi",
            "role": "terapeuta",
            "is_verified": True,
            "is_active": True,
            "approval_status": "approvato",
            "created_at": datetime.now(timezone.utc)
        })
        await db.terapisti.insert_one({
            "user_id": str(result.inserted_id),
            "nome": "Maria",
            "cognome": "Rossi",
            "email": demo_email,
            "telefono": "+39 02 1234567",
            "bio": "Psicologa e sessuologa clinica con 12 anni di esperienza. Approccio integrato cognitivo-comportamentale e sistemico.",
            "anni_esperienza": 12,
            "specializzazioni": ["Sessuologia clinica", "Terapia di coppia", "Disfunzioni sessuali"],
            "formazione": [
                {"titolo": "Laurea in Psicologia Clinica", "istituto": "Università La Sapienza, Roma", "anno": 2010},
                {"titolo": "Specializzazione in Sessuologia", "istituto": "IISS, Milano", "anno": 2013}
            ],
            "approccio_terapeutico": "Cognitivo-Comportamentale integrato",
            "genere": "F",
            "albo_numero": "12345",
            "albo_ordine": "Ordine degli Psicologi della Lombardia",
            "albo_iscrizione_data": "2011-03-15",
            "assicurazione_compagnia": "Generali",
            "assicurazione_numero_polizza": "POL-2024-001",
            "assicurazione_scadenza": "2025-12-31",
            "prezzo_sessione": 90.0,
            "lingue": ["Italiano", "Inglese"],
            "autocertificazione_firmata": True,
            "autocertificazione_data": datetime.now(timezone.utc),
            "disponibilita": [
                {"giorno": "Lunedì", "ora_inizio": "09:00", "ora_fine": "18:00"},
                {"giorno": "Mercoledì", "ora_inizio": "09:00", "ora_fine": "18:00"},
                {"giorno": "Venerdì", "ora_inizio": "09:00", "ora_fine": "14:00"}
            ],
            "created_at": datetime.now(timezone.utc)
        })
        logging.info("[SEED] Demo terapeuta creato")

    # Seed demo patient
    demo_paz_email = "demo.paziente@funzionabene.it"
    demo_paz = await db.users.find_one({"email": demo_paz_email})
    if not demo_paz:
        result2 = await db.users.insert_one({
            "email": demo_paz_email,
            "password_hash": hash_password("Paziente#2024!"),
            "nome": "Luca",
            "cognome": "Bianchi",
            "role": "paziente",
            "is_verified": True,
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        })
        await db.pazienti.insert_one({
            "user_id": str(result2.inserted_id),
            "nome": "Luca",
            "cognome": "Bianchi",
            "data_nascita": "1990-05-15",
            "genere": "M",
            "codice_fiscale": "BNCLCU90E15H501Z",
            "telefono": "+39 333 1234567",
            "citta": "Milano",
            "cap": "20121",
            "created_at": datetime.now(timezone.utc)
        })
        logging.info("[SEED] Demo paziente creato")

@app.on_event("shutdown")
async def shutdown():
    client.close()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
