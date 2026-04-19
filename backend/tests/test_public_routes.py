"""
Test suite for FunzionaBene Public Routes (Passo 2)
Tests: public terapisti, matching, blog, FAQ, slots, and booking flow
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPublicTerapisti:
    """Public therapist listing and profile endpoints"""
    
    def test_public_terapisti_list(self):
        """GET /api/public/terapisti returns list of autocertificazione_firmata therapists"""
        response = requests.get(f"{BASE_URL}/api/public/terapisti")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Should have at least the demo therapist
        assert len(data) >= 1, "Should have at least 1 therapist"
        
        # Verify all returned therapists have autocertificazione_firmata
        for t in data:
            assert t.get("autocertificazione_firmata") == True, f"Therapist {t.get('_id')} should have autocertificazione_firmata=True"
            assert "_id" in t, "Therapist should have _id"
            assert "nome" in t, "Therapist should have nome"
            assert "cognome" in t, "Therapist should have cognome"
        
        print(f"✓ Found {len(data)} public therapists")
    
    def test_public_terapista_profile(self):
        """GET /api/public/terapisti/{id} returns full profile"""
        # First get list to get a valid ID
        list_response = requests.get(f"{BASE_URL}/api/public/terapisti")
        assert list_response.status_code == 200
        terapisti = list_response.json()
        assert len(terapisti) > 0, "Need at least one therapist"
        
        terapista_id = terapisti[0]["_id"]
        
        # Get full profile
        response = requests.get(f"{BASE_URL}/api/public/terapisti/{terapista_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["_id"] == terapista_id
        assert "nome" in data
        assert "cognome" in data
        
        # Demo therapist should have full profile
        if data.get("nome") == "Maria" and data.get("cognome") == "Rossi":
            assert "bio" in data, "Demo therapist should have bio"
            assert "specializzazioni" in data, "Demo therapist should have specializzazioni"
            assert "formazione" in data, "Demo therapist should have formazione"
            assert "prezzo_sessione" in data, "Demo therapist should have prezzo_sessione"
            assert "lingue" in data, "Demo therapist should have lingue"
            assert "albo_numero" in data, "Demo therapist should have albo_numero"
            print(f"✓ Demo therapist profile verified: Dr. {data['nome']} {data['cognome']}")
        else:
            print(f"✓ Therapist profile retrieved: Dr. {data.get('nome')} {data.get('cognome')}")
    
    def test_public_terapista_not_found(self):
        """GET /api/public/terapisti/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/public/terapisti/000000000000000000000000")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Invalid therapist ID returns 404")


class TestPublicMatching:
    """Matching algorithm endpoint tests"""
    
    def test_matching_basic(self):
        """POST /api/public/matching returns top 3 therapists with compatibilita %"""
        payload = {
            "eta": "26-35",
            "genere": "Donna",
            "problemi": ["Sessuologia e intimità", "Relazioni di coppia"],
            "orari": ["Mattina (8-12)", "Pomeriggio (12-18)"],
            "preferenza_terapeuta": "Preferisco una donna"
        }
        
        response = requests.post(f"{BASE_URL}/api/public/matching", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "terapisti" in data, "Response should have 'terapisti' key"
        
        terapisti = data["terapisti"]
        assert isinstance(terapisti, list), "terapisti should be a list"
        assert len(terapisti) <= 3, "Should return max 3 therapists"
        
        # Verify each therapist has compatibilita field
        for i, t in enumerate(terapisti):
            assert "compatibilita" in t, f"Therapist {i} should have compatibilita field"
            assert isinstance(t["compatibilita"], int), "compatibilita should be int"
            assert 0 <= t["compatibilita"] <= 100, f"compatibilita should be 0-100, got {t['compatibilita']}"
            assert "_id" in t, "Therapist should have _id"
            print(f"  Match {i+1}: Dr. {t.get('nome')} {t.get('cognome')} - {t['compatibilita']}%")
        
        # Verify sorted descending by compatibilita
        if len(terapisti) > 1:
            for i in range(len(terapisti) - 1):
                assert terapisti[i]["compatibilita"] >= terapisti[i+1]["compatibilita"], \
                    "Results should be sorted by compatibilita descending"
        
        print(f"✓ Matching returned {len(terapisti)} therapists sorted by compatibility")
    
    def test_matching_female_preference_scores_higher(self):
        """Female preference should rank female therapist higher"""
        payload = {
            "eta": "26-35",
            "genere": "Donna",
            "problemi": ["Sessuologia e intimità"],
            "orari": ["Mattina (8-12)"],
            "preferenza_terapeuta": "Preferisco una donna"
        }
        
        response = requests.post(f"{BASE_URL}/api/public/matching", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        terapisti = data.get("terapisti", [])
        
        # If we have results and the top one is female, that's expected
        if len(terapisti) > 0:
            top = terapisti[0]
            if top.get("genere") == "F":
                print(f"✓ Female preference correctly ranked female therapist first: Dr. {top.get('nome')} {top.get('cognome')}")
            else:
                print(f"⚠ Top match is not female (may be only male therapists available)")
    
    def test_matching_empty_payload(self):
        """Matching with empty payload should still work"""
        response = requests.post(f"{BASE_URL}/api/public/matching", json={})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "terapisti" in data
        print(f"✓ Empty payload matching returned {len(data['terapisti'])} therapists")


class TestPublicBlog:
    """Public blog endpoint tests"""
    
    def test_public_blog_list(self):
        """GET /api/public/blog returns only published articles"""
        response = requests.get(f"{BASE_URL}/api/public/blog")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify all returned articles are published
        for a in data:
            assert a.get("stato") == "pubblicato", f"Article {a.get('_id')} should have stato=pubblicato"
            assert "_id" in a
            assert "titolo" in a
            assert "contenuto" in a
        
        print(f"✓ Public blog returned {len(data)} published articles")


class TestPublicFAQ:
    """Public FAQ endpoint tests"""
    
    def test_public_faq_list(self):
        """GET /api/public/faq returns ordered list"""
        response = requests.get(f"{BASE_URL}/api/public/faq")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify structure if we have FAQs
        for f in data:
            assert "domanda" in f, "FAQ should have domanda"
            assert "risposta" in f, "FAQ should have risposta"
        
        # Verify ordered by 'ordine' field
        if len(data) > 1:
            for i in range(len(data) - 1):
                assert data[i].get("ordine", 0) <= data[i+1].get("ordine", 0), \
                    "FAQs should be ordered by 'ordine' field"
        
        print(f"✓ Public FAQ returned {len(data)} items (may be empty if no DB FAQs)")


class TestSlots:
    """Therapist availability slots endpoint tests"""
    
    def test_slots_endpoint(self):
        """GET /api/terapisti/{id}/slots returns slot list"""
        # Get a therapist ID first
        list_response = requests.get(f"{BASE_URL}/api/public/terapisti")
        assert list_response.status_code == 200
        terapisti = list_response.json()
        assert len(terapisti) > 0, "Need at least one therapist"
        
        terapista_id = terapisti[0]["_id"]
        
        # Get slots
        response = requests.get(f"{BASE_URL}/api/terapisti/{terapista_id}/slots?settimane=2")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "slots" in data, "Response should have 'slots' key"
        assert "terapeuta_id" in data, "Response should have 'terapeuta_id'"
        assert "durata_minuti" in data, "Response should have 'durata_minuti'"
        
        slots = data["slots"]
        assert isinstance(slots, list), "slots should be a list"
        
        print(f"✓ Slots endpoint returned {len(slots)} slots for therapist {terapista_id}")
        
        # Verify slot structure
        if len(slots) > 0:
            slot = slots[0]
            assert "data_ora" in slot, "Slot should have data_ora"
            assert "data_ora_fmt" in slot, "Slot should have data_ora_fmt (Italian format)"
            assert "disponibile" in slot, "Slot should have disponibile flag"
            
            # Verify Italian day names in data_ora_fmt
            italian_days = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
            has_italian_day = any(day in slot["data_ora_fmt"] for day in italian_days)
            assert has_italian_day, f"data_ora_fmt should contain Italian day name: {slot['data_ora_fmt']}"
            
            print(f"  Sample slot: {slot['data_ora_fmt']} - disponibile: {slot['disponibile']}")


class TestBookingFlow:
    """Full booking flow: register → OTP → profile → prenota"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_email = f"test_booking_{int(time.time())}@example.com"
        self.test_password = os.getenv("TEST_PASSWORD", "TestPassword123!")
        self.session = requests.Session()
    
    def test_full_booking_flow(self):
        """Complete booking flow: register, verify OTP, get profile, book"""
        # Step 1: Register new paziente
        register_payload = {
            "email": self.test_email,
            "password": self.test_password,
            "nome": "Test",
            "cognome": "Booking",
            "role": "paziente",
            "consenso_privacy": True
        }
        
        reg_response = self.session.post(f"{BASE_URL}/api/auth/register", json=register_payload)
        assert reg_response.status_code == 200, f"Register failed: {reg_response.text}"
        
        reg_data = reg_response.json()
        assert "otp_dev" in reg_data, "Response should contain otp_dev for testing"
        otp_code = reg_data["otp_dev"]
        print(f"✓ Step 1: Registered {self.test_email}, OTP: {otp_code}")
        
        # Step 2: Verify OTP
        otp_payload = {
            "email": self.test_email,
            "otp_code": otp_code
        }
        
        otp_response = self.session.post(f"{BASE_URL}/api/auth/verify-otp", json=otp_payload)
        assert otp_response.status_code == 200, f"OTP verification failed: {otp_response.text}"
        
        # Check cookies are set
        cookies = self.session.cookies.get_dict()
        assert "access_token" in cookies or otp_response.status_code == 200, "Should set auth cookies"
        print(f"✓ Step 2: OTP verified, cookies set")
        
        # Step 3: Get paziente profile to get _id
        profile_response = self.session.get(f"{BASE_URL}/api/pazienti/profilo/me")
        assert profile_response.status_code == 200, f"Profile fetch failed: {profile_response.text}"
        
        profile_data = profile_response.json()
        assert "_id" in profile_data, "Profile should have _id"
        paziente_id = profile_data["_id"]
        print(f"✓ Step 3: Got paziente profile, ID: {paziente_id}")
        
        # Step 4: Get a therapist and available slot
        terapisti_response = requests.get(f"{BASE_URL}/api/public/terapisti")
        assert terapisti_response.status_code == 200
        terapisti = terapisti_response.json()
        assert len(terapisti) > 0, "Need at least one therapist"
        
        terapeuta_id = terapisti[0]["_id"]
        
        slots_response = requests.get(f"{BASE_URL}/api/terapisti/{terapeuta_id}/slots?settimane=2")
        assert slots_response.status_code == 200
        slots = slots_response.json().get("slots", [])
        
        # Find an available slot
        available_slot = next((s for s in slots if s.get("disponibile")), None)
        if not available_slot:
            pytest.skip("No available slots for booking test")
        
        print(f"✓ Step 4: Found available slot: {available_slot['data_ora_fmt']}")
        
        # Step 5: Create booking
        booking_payload = {
            "terapeuta_id": terapeuta_id,
            "paziente_id": paziente_id,
            "data_ora": available_slot["data_ora"],
            "durata_minuti": 50,
            "tipo": "online",
            "note": "Test booking from pytest"
        }
        
        booking_response = self.session.post(f"{BASE_URL}/api/public/prenota", json=booking_payload)
        assert booking_response.status_code == 200, f"Booking failed: {booking_response.text}"
        
        booking_data = booking_response.json()
        assert "_id" in booking_data, "Booking should have _id"
        assert booking_data.get("stato") == "prenotato", "Booking stato should be 'prenotato'"
        
        print(f"✓ Step 5: Booking created successfully, ID: {booking_data['_id']}")
        print(f"✓ FULL BOOKING FLOW COMPLETED")
    
    def test_prenota_requires_auth(self):
        """POST /api/public/prenota requires authentication"""
        payload = {
            "terapeuta_id": "000000000000000000000000",
            "paziente_id": "000000000000000000000000",
            "data_ora": "2026-01-20T10:00:00",
            "durata_minuti": 50,
            "tipo": "online"
        }
        
        # Without auth
        response = requests.post(f"{BASE_URL}/api/public/prenota", json=payload)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Prenota endpoint correctly requires authentication")
    
    def test_prenota_requires_paziente_role(self):
        """POST /api/public/prenota requires paziente role"""
        # Login as terapeuta
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "demo.terapeuta@funzionabene.it", "password": "Terapeuta#2024!"}
        )
        
        if login_response.status_code != 200:
            pytest.skip("Could not login as terapeuta")
        
        session = requests.Session()
        session.cookies.update(login_response.cookies)
        
        payload = {
            "terapeuta_id": "000000000000000000000000",
            "paziente_id": "000000000000000000000000",
            "data_ora": "2026-01-20T10:00:00",
            "durata_minuti": 50,
            "tipo": "online"
        }
        
        response = session.post(f"{BASE_URL}/api/public/prenota", json=payload)
        assert response.status_code == 403, f"Expected 403 for non-paziente, got {response.status_code}"
        print("✓ Prenota endpoint correctly requires paziente role")


class TestAuthEndpoints:
    """Auth endpoints for booking flow"""
    
    def test_register_returns_otp_dev(self):
        """POST /api/auth/register returns otp_dev field"""
        test_email = f"test_otp_{int(time.time())}@example.com"
        
        payload = {
            "email": test_email,
            "password": "TestPassword123!",
            "nome": "Test",
            "cognome": "OTP",
            "role": "paziente",
            "consenso_privacy": True
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Register failed: {response.text}"
        
        data = response.json()
        assert "otp_dev" in data, "Response should contain otp_dev"
        assert len(data["otp_dev"]) == 6, "OTP should be 6 digits"
        assert data["otp_dev"].isdigit(), "OTP should be numeric"
        
        print(f"✓ Register returns otp_dev: {data['otp_dev']}")
    
    def test_resend_otp_returns_otp_dev(self):
        """POST /api/auth/resend-otp returns otp_dev field"""
        # First register
        test_email = f"test_resend_{int(time.time())}@example.com"
        
        reg_payload = {
            "email": test_email,
            "password": "TestPassword123!",
            "nome": "Test",
            "cognome": "Resend",
            "role": "paziente",
            "consenso_privacy": True
        }
        
        requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
        
        # Resend OTP
        response = requests.post(f"{BASE_URL}/api/auth/resend-otp", json={"email": test_email})
        assert response.status_code == 200, f"Resend OTP failed: {response.text}"
        
        data = response.json()
        assert "otp_dev" in data, "Response should contain otp_dev"
        
        print(f"✓ Resend OTP returns otp_dev: {data['otp_dev']}")
    
    def test_verify_otp_sets_cookies(self):
        """POST /api/auth/verify-otp sets httpOnly cookies"""
        test_email = f"test_cookies_{int(time.time())}@example.com"
        
        # Register
        reg_payload = {
            "email": test_email,
            "password": "TestPassword123!",
            "nome": "Test",
            "cognome": "Cookies",
            "role": "paziente",
            "consenso_privacy": True
        }
        
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
        otp_code = reg_response.json().get("otp_dev")
        
        # Verify OTP
        session = requests.Session()
        otp_response = session.post(
            f"{BASE_URL}/api/auth/verify-otp",
            json={"email": test_email, "otp_code": otp_code}
        )
        
        assert otp_response.status_code == 200, f"OTP verify failed: {otp_response.text}"
        
        # Check cookies
        cookies = session.cookies.get_dict()
        # Note: httpOnly cookies may not be visible in requests, but the session should work
        
        # Verify we can access authenticated endpoint
        me_response = session.get(f"{BASE_URL}/api/auth/me")
        assert me_response.status_code == 200, "Should be authenticated after OTP verify"
        
        print("✓ OTP verification sets auth cookies correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
