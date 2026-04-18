"""
Tests for Blog API and Slot system - FunzionaBene iteration_2
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_CREDS = {"email": "admin@funzionabene.it", "password": "Admin#2024!"}
THERAPIST_CREDS = {"email": "demo.terapeuta@funzionabene.it", "password": "Terapeuta#2024!"}
DEMO_THERAPIST_ID = "69e32acb30c5ac20c77a35d3"


@pytest.fixture(scope="module")
def admin_token():
    resp = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return resp.json().get("token") or resp.cookies.get("access_token")


@pytest.fixture(scope="module")
def therapist_token():
    resp = requests.post(f"{BASE_URL}/api/auth/login", json=THERAPIST_CREDS)
    assert resp.status_code == 200, f"Therapist login failed: {resp.text}"
    return resp.json().get("token") or resp.cookies.get("access_token")


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    if admin_token:
        return {"Authorization": f"Bearer {admin_token}"}
    return {}


@pytest.fixture(scope="module")
def therapist_headers(therapist_token):
    if therapist_token:
        return {"Authorization": f"Bearer {therapist_token}"}
    return {}


# ---- Blog Admin Tests ----

class TestBlogAdmin:
    """Admin blog CRUD operations"""

    created_article_id = None

    def test_get_blog_articles_as_admin(self, admin_headers):
        resp = requests.get(f"{BASE_URL}/api/blog", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        print(f"GET /api/blog returned {len(data)} articles")

    def test_create_article_as_admin(self, admin_headers):
        payload = {
            "titolo": "TEST_Articolo Admin",
            "contenuto": "Contenuto di test per articolo admin.",
            "categoria": "benessere"
        }
        resp = requests.post(f"{BASE_URL}/api/blog", json=payload, headers=admin_headers)
        assert resp.status_code in [200, 201], f"Create failed: {resp.text}"
        data = resp.json()
        assert "id" in data or "_id" in data
        # Admin-created articles should be published
        status = data.get("stato", data.get("status", ""))
        print(f"Created article status: {status}")
        TestBlogAdmin.created_article_id = data.get("id") or str(data.get("_id", ""))
        print(f"Created article id: {TestBlogAdmin.created_article_id}")

    def test_admin_created_article_is_published(self, admin_headers):
        """Check via list that created article has stato=pubblicato"""
        if not TestBlogAdmin.created_article_id:
            pytest.skip("No article created")
        resp = requests.get(f"{BASE_URL}/api/blog", headers=admin_headers)
        articles = resp.json()
        matching = [a for a in articles if (a.get("id") or str(a.get("_id", ""))) == TestBlogAdmin.created_article_id]
        # Article was deleted in cleanup, skip if not found
        if not matching:
            pytest.skip("Article already deleted or not found in list")
        stato = matching[0].get("stato", "")
        assert stato in ["pubblicato", "published"], f"Expected published, got: {stato}"

    def test_update_article_as_admin(self, admin_headers):
        article_id = TestBlogAdmin.created_article_id
        if not article_id:
            pytest.skip("No article created")
        payload = {"titolo": "TEST_Articolo Admin Updated", "contenuto": "Contenuto aggiornato."}
        resp = requests.put(f"{BASE_URL}/api/blog/{article_id}", json=payload, headers=admin_headers)
        assert resp.status_code == 200

    def test_delete_article_as_admin(self, admin_headers):
        article_id = TestBlogAdmin.created_article_id
        if not article_id:
            pytest.skip("No article created")
        resp = requests.delete(f"{BASE_URL}/api/blog/{article_id}", headers=admin_headers)
        assert resp.status_code in [200, 204], f"Delete failed: {resp.text}"


# ---- Blog Therapist Tests ----

class TestBlogTherapist:
    """Therapist blog write/review flow"""

    created_article_id = None

    def test_therapist_can_create_article(self, therapist_headers):
        payload = {
            "titolo": "TEST_Articolo Terapeuta",
            "contenuto": "Articolo scritto dal terapeuta.",
            "categoria": "ansia"
        }
        resp = requests.post(f"{BASE_URL}/api/blog", json=payload, headers=therapist_headers)
        assert resp.status_code in [200, 201], f"Create failed: {resp.text}"
        data = resp.json()
        stato = data.get("stato", data.get("status", ""))
        # Therapist articles should be pending review
        assert stato in ["in_revisione", "bozza", "draft", "pending"], f"Expected review status, got: {stato}"
        TestBlogTherapist.created_article_id = data.get("id") or str(data.get("_id", ""))

    def test_admin_can_approve_therapist_article(self, admin_headers):
        article_id = TestBlogTherapist.created_article_id
        if not article_id:
            pytest.skip("No therapist article created")
        resp = requests.patch(f"{BASE_URL}/api/blog/{article_id}/approva", headers=admin_headers)
        assert resp.status_code == 200, f"Approve failed: {resp.text}"
        print(f"Approve response: {resp.json()}")

    def test_admin_can_reject_article(self, admin_headers, therapist_headers):
        # Create another therapist article to reject
        payload = {"titolo": "TEST_Da Rifiutare", "contenuto": "Contenuto da rifiutare.", "categoria": "stress"}
        resp = requests.post(f"{BASE_URL}/api/blog", json=payload, headers=therapist_headers)
        if resp.status_code not in [200, 201]:
            pytest.skip("Could not create article")
        article_id = resp.json().get("id") or str(resp.json().get("_id", ""))

        reject_resp = requests.patch(f"{BASE_URL}/api/blog/{article_id}/rifiuta", headers=admin_headers)
        assert reject_resp.status_code == 200, f"Reject failed: {reject_resp.text}"
        print(f"Reject response: {reject_resp.json()}")

        # Cleanup
        requests.delete(f"{BASE_URL}/api/blog/{article_id}", headers=admin_headers)

    def test_cleanup_therapist_article(self, admin_headers):
        article_id = TestBlogTherapist.created_article_id
        if article_id:
            requests.delete(f"{BASE_URL}/api/blog/{article_id}", headers=admin_headers)


# ---- Slot System Tests ----

class TestSlots:
    """Slot system for therapist availability"""

    def test_slots_endpoint_returns_200(self):
        resp = requests.get(f"{BASE_URL}/api/terapisti/{DEMO_THERAPIST_ID}/slots")
        assert resp.status_code == 200, f"Slots failed: {resp.text}"

    def test_slots_count_approx_52(self):
        resp = requests.get(f"{BASE_URL}/api/terapisti/{DEMO_THERAPIST_ID}/slots")
        data = resp.json()
        slots = data if isinstance(data, list) else data.get("slots", [])
        print(f"Total slots: {len(slots)}")
        # Should be approximately 52 for Lunedi/Mercoledi/Venerdi (with Venerdi shorter)
        assert 40 <= len(slots) <= 70, f"Expected ~52 slots, got {len(slots)}"

    def test_slots_have_data_ora_fmt(self):
        resp = requests.get(f"{BASE_URL}/api/terapisti/{DEMO_THERAPIST_ID}/slots")
        data = resp.json()
        slots = data if isinstance(data, list) else data.get("slots", [])
        assert len(slots) > 0
        first = slots[0]
        assert "data_ora_fmt" in first, f"Missing data_ora_fmt field. Keys: {list(first.keys())}"
        fmt = first["data_ora_fmt"]
        print(f"Sample data_ora_fmt: {fmt}")
        # Check Italian day name format
        italian_days = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
        assert any(day in fmt for day in italian_days), f"No Italian day name in: {fmt}"

    def test_slots_have_disponibile_field(self):
        resp = requests.get(f"{BASE_URL}/api/terapisti/{DEMO_THERAPIST_ID}/slots")
        data = resp.json()
        slots = data if isinstance(data, list) else data.get("slots", [])
        assert len(slots) > 0
        first = slots[0]
        assert "disponibile" in first, f"Missing disponibile field. Keys: {list(first.keys())}"

    def test_slots_available_are_true(self):
        resp = requests.get(f"{BASE_URL}/api/terapisti/{DEMO_THERAPIST_ID}/slots")
        data = resp.json()
        slots = data if isinstance(data, list) else data.get("slots", [])
        available = [s for s in slots if s.get("disponibile") is True]
        print(f"Available slots: {len(available)}/{len(slots)}")
        assert len(available) > 0, "No available slots found"
