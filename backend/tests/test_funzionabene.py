"""Backend tests for FunzionaBene.it clinic management system"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_EMAIL = "admin@funzionabene.it"
ADMIN_PASS = "Admin#2024!"
TERAPEUTA_EMAIL = "demo.terapeuta@funzionabene.it"
TERAPEUTA_PASS = "Terapeuta#2024!"
PAZIENTE_EMAIL = "demo.paziente@funzionabene.it"
PAZIENTE_PASS = "Paziente#2024!"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    token = r.json().get("access_token")
    if token:
        s.headers.update({"Authorization": f"Bearer {token}"})
    return s


@pytest.fixture(scope="module")
def terapeuta_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": TERAPEUTA_EMAIL, "password": TERAPEUTA_PASS})
    assert r.status_code == 200, f"Terapeuta login failed: {r.text}"
    return s


@pytest.fixture(scope="module")
def paziente_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": PAZIENTE_EMAIL, "password": PAZIENTE_PASS})
    assert r.status_code == 200, f"Paziente login failed: {r.text}"
    return s


# ─── Auth tests ───────────────────────────────────────────────────────────────
class TestAuth:
    """Authentication tests"""

    def test_admin_login_returns_role(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        assert r.status_code == 200
        data = r.json()
        assert data["role"] == "admin"
        assert data["email"] == ADMIN_EMAIL

    def test_terapeuta_login(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": TERAPEUTA_EMAIL, "password": TERAPEUTA_PASS})
        assert r.status_code == 200
        data = r.json()
        assert data["role"] == "terapeuta"

    def test_paziente_login(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": PAZIENTE_EMAIL, "password": PAZIENTE_PASS})
        assert r.status_code == 200
        data = r.json()
        assert data["role"] == "paziente"

    def test_invalid_credentials(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "wrong@test.it", "password": "wrong"})
        assert r.status_code == 401

    def test_auth_me_with_cookie(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert data["role"] == "admin"

    def test_register_otp_flow(self):
        """Test OTP registration flow"""
        import time
        ts = int(time.time())
        email = f"test.otp.{ts}@example.it"
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email, "password": "TestPass#2024", "nome": "Test", "cognome": "User", "role": "paziente"
        })
        assert r.status_code == 200
        data = r.json()
        assert "otp_dev" in data
        otp = data["otp_dev"]
        # Verify OTP
        r2 = requests.post(f"{BASE_URL}/api/auth/verify-otp", json={"email": email, "otp_code": otp})
        assert r2.status_code == 200
        assert r2.json()["role"] == "paziente"

    def test_logout(self, admin_session):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        assert r.status_code == 200
        r2 = s.post(f"{BASE_URL}/api/auth/logout")
        assert r2.status_code == 200


# ─── Dashboard stats ──────────────────────────────────────────────────────────
class TestDashboard:
    """Dashboard endpoint tests"""

    def test_get_stats(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/dashboard/stats")
        assert r.status_code == 200
        data = r.json()
        assert "terapisti" in data
        assert "pazienti" in data
        assert "appuntamenti_totali" in data or "appuntamenti" in data

    def test_stats_unauthorized(self):
        r = requests.get(f"{BASE_URL}/api/dashboard/stats")
        assert r.status_code == 401


# ─── Terapisti ────────────────────────────────────────────────────────────────
class TestTerapisti:
    """Terapisti CRUD tests"""

    def test_list_terapisti(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/terapisti")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        names = [f"{d.get('nome','')} {d.get('cognome','')}".strip() for d in data]
        assert any("Rossi" in n or "Maria" in n for n in names), f"Demo terapeuta not found: {names}"

    def test_create_and_delete_terapista(self, admin_session):
        r = admin_session.post(f"{BASE_URL}/api/terapisti", json={
            "nome": "TEST_Terapeuta", "cognome": "Test", "albo_numero": "12345"
        })
        assert r.status_code == 200
        tid = r.json()["_id"]
        # Verify
        r2 = admin_session.get(f"{BASE_URL}/api/terapisti/{tid}")
        assert r2.status_code == 200
        assert r2.json()["nome"] == "TEST_Terapeuta"
        # Delete
        r3 = admin_session.delete(f"{BASE_URL}/api/terapisti/{tid}")
        assert r3.status_code == 200


# ─── Pazienti ────────────────────────────────────────────────────────────────
class TestPazienti:
    """Pazienti CRUD tests"""

    def test_list_pazienti(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/pazienti")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_create_and_delete_paziente(self, admin_session):
        r = admin_session.post(f"{BASE_URL}/api/pazienti", json={
            "nome": "TEST_Paziente", "cognome": "Test"
        })
        assert r.status_code == 200
        pid = r.json()["_id"]
        # Delete
        r2 = admin_session.delete(f"{BASE_URL}/api/pazienti/{pid}")
        assert r2.status_code == 200


# ─── Appuntamenti ────────────────────────────────────────────────────────────
class TestAppuntamenti:
    """Appuntamenti tests"""

    def test_list_appuntamenti(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/appuntamenti")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
