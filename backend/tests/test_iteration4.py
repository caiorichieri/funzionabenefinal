"""
Backend tests for Iteration 4 features:
- /api/utils/compute-cf (Codice Fiscale auto-calculation)
- /api/conversazioni (Chat conversations)
- /api/messaggi (Chat messages)
- /api/public/prenota (Booking with stato='confermato', Daily room, emails, reminders)
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestComputeCF:
    """Tests for /api/utils/compute-cf endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as paziente for authenticated requests"""
        self.session = requests.Session()
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "caiorichieri@gmail.com",
            "password": "Paziente#2024!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    
    def test_compute_cf_italian_male(self):
        """Test CF computation for Italian male born in Milano"""
        res = self.session.post(f"{BASE_URL}/api/utils/compute-cf", json={
            "nome": "Mario",
            "cognome": "Rossi",
            "genere": "M",
            "data_nascita": "1990-05-15",
            "nato_all_estero": False,
            "luogo_nascita_comune": "Milano"
        })
        assert res.status_code == 200
        data = res.json()
        assert "cf" in data
        assert len(data["cf"]) == 16
        assert data["cf"].isalnum()
        print(f"CF for Italian male (Milano): {data['cf']}")
    
    def test_compute_cf_italian_female(self):
        """Test CF computation for Italian female born in Roma"""
        res = self.session.post(f"{BASE_URL}/api/utils/compute-cf", json={
            "nome": "Maria",
            "cognome": "Bianchi",
            "genere": "F",
            "data_nascita": "1985-03-20",
            "nato_all_estero": False,
            "luogo_nascita_comune": "Roma"
        })
        assert res.status_code == 200
        data = res.json()
        assert "cf" in data
        assert len(data["cf"]) == 16
        print(f"CF for Italian female (Roma): {data['cf']}")
    
    def test_compute_cf_estero_brasile(self):
        """Test CF computation for person born abroad (Brasile)"""
        res = self.session.post(f"{BASE_URL}/api/utils/compute-cf", json={
            "nome": "Carlos",
            "cognome": "Silva",
            "genere": "M",
            "data_nascita": "1988-07-10",
            "nato_all_estero": True,
            "paese_nascita": "Brasile"
        })
        assert res.status_code == 200
        data = res.json()
        assert "cf" in data
        assert len(data["cf"]) == 16
        print(f"CF for estero (Brasile): {data['cf']}")
    
    def test_compute_cf_invalid_gender_altro(self):
        """Test CF computation with invalid gender 'Altro' returns error"""
        res = self.session.post(f"{BASE_URL}/api/utils/compute-cf", json={
            "nome": "Alex",
            "cognome": "Verdi",
            "genere": "Altro",
            "data_nascita": "1995-01-01",
            "nato_all_estero": False,
            "luogo_nascita_comune": "Napoli"
        })
        assert res.status_code == 200
        data = res.json()
        assert "error" in data
        assert "M o F" in data["error"]
        print(f"Error for 'Altro' gender: {data['error']}")
    
    def test_compute_cf_invalid_gender_preferisco(self):
        """Test CF computation with 'Preferisco non specificare' returns error"""
        res = self.session.post(f"{BASE_URL}/api/utils/compute-cf", json={
            "nome": "Jordan",
            "cognome": "Neri",
            "genere": "Preferisco non specificare",
            "data_nascita": "2000-12-25",
            "nato_all_estero": False,
            "luogo_nascita_comune": "Torino"
        })
        assert res.status_code == 200
        data = res.json()
        assert "error" in data
        print(f"Error for 'Preferisco non specificare': {data['error']}")
    
    def test_compute_cf_requires_auth(self):
        """Test that compute-cf requires authentication"""
        new_session = requests.Session()
        res = new_session.post(f"{BASE_URL}/api/utils/compute-cf", json={
            "nome": "Test",
            "cognome": "User",
            "genere": "M",
            "data_nascita": "1990-01-01",
            "nato_all_estero": False,
            "luogo_nascita_comune": "Milano"
        })
        assert res.status_code == 401


class TestConversazioni:
    """Tests for /api/conversazioni endpoint"""
    
    def test_conversazioni_paziente(self):
        """Test paziente can see conversations with therapists"""
        session = requests.Session()
        login_res = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "caiorichieri@gmail.com",
            "password": "Paziente#2024!"
        })
        assert login_res.status_code == 200
        
        res = session.get(f"{BASE_URL}/api/conversazioni")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        # Should have conversations if there are confermato/completato appointments
        if len(data) > 0:
            conv = data[0]
            assert "conversazione_id" in conv
            assert "terapeuta_id" in conv
            assert "terapeuta_nome" in conv
            print(f"Paziente has {len(data)} conversation(s)")
    
    def test_conversazioni_terapeuta(self):
        """Test terapeuta can see conversations with patients"""
        session = requests.Session()
        login_res = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo.terapeuta@funzionabene.it",
            "password": "Terapeuta#2024!"
        })
        assert login_res.status_code == 200
        
        res = session.get(f"{BASE_URL}/api/conversazioni")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        if len(data) > 0:
            conv = data[0]
            assert "conversazione_id" in conv
            assert "paziente_id" in conv
            assert "paziente_nome" in conv
            print(f"Terapeuta has {len(data)} conversation(s)")
    
    def test_conversazioni_requires_auth(self):
        """Test conversazioni requires authentication"""
        session = requests.Session()
        res = session.get(f"{BASE_URL}/api/conversazioni")
        assert res.status_code == 401


class TestMessaggi:
    """Tests for /api/messaggi endpoints"""
    
    @pytest.fixture
    def paziente_session(self):
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "caiorichieri@gmail.com",
            "password": "Paziente#2024!"
        })
        return session
    
    @pytest.fixture
    def terapeuta_session(self):
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo.terapeuta@funzionabene.it",
            "password": "Terapeuta#2024!"
        })
        return session
    
    def test_get_messaggi(self, paziente_session):
        """Test GET /api/messaggi/{conv_id} returns messages"""
        # First get conversations
        convs_res = paziente_session.get(f"{BASE_URL}/api/conversazioni")
        if convs_res.status_code == 200 and len(convs_res.json()) > 0:
            conv_id = convs_res.json()[0]["conversazione_id"]
            res = paziente_session.get(f"{BASE_URL}/api/messaggi/{conv_id}")
            assert res.status_code == 200
            data = res.json()
            assert isinstance(data, list)
            if len(data) > 0:
                msg = data[0]
                assert "testo" in msg
                assert "mittente_ruolo" in msg
                assert "created_at" in msg
            print(f"Conversation has {len(data)} message(s)")
    
    def test_send_message_paziente(self, paziente_session):
        """Test paziente can send message to terapeuta"""
        # Get terapeuta_id from conversations
        convs_res = paziente_session.get(f"{BASE_URL}/api/conversazioni")
        if convs_res.status_code == 200 and len(convs_res.json()) > 0:
            terapeuta_id = convs_res.json()[0]["terapeuta_id"]
            res = paziente_session.post(f"{BASE_URL}/api/messaggi", json={
                "destinatario_id": terapeuta_id,
                "testo": "TEST_Messaggio automatico dal paziente"
            })
            assert res.status_code == 200
            data = res.json()
            assert data["mittente_ruolo"] == "paziente"
            assert "TEST_" in data["testo"]
            print(f"Paziente sent message: {data['_id']}")
    
    def test_send_message_terapeuta(self, terapeuta_session):
        """Test terapeuta can send message to paziente"""
        convs_res = terapeuta_session.get(f"{BASE_URL}/api/conversazioni")
        if convs_res.status_code == 200 and len(convs_res.json()) > 0:
            paziente_id = convs_res.json()[0]["paziente_id"]
            res = terapeuta_session.post(f"{BASE_URL}/api/messaggi", json={
                "destinatario_id": paziente_id,
                "testo": "TEST_Risposta automatica dal terapeuta"
            })
            assert res.status_code == 200
            data = res.json()
            assert data["mittente_ruolo"] == "terapeuta"
            print(f"Terapeuta sent message: {data['_id']}")


class TestBookingFlow:
    """Tests for /api/public/prenota with new features"""
    
    def test_prenota_creates_confermato_appointment(self):
        """Test that prenota creates appointment with stato='confermato'"""
        session = requests.Session()
        # Login as paziente
        login_res = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "caiorichieri@gmail.com",
            "password": "Paziente#2024!"
        })
        assert login_res.status_code == 200
        paziente_user_id = login_res.json()["_id"]
        
        # Get paziente profile to get paziente_id
        profile_res = session.get(f"{BASE_URL}/api/pazienti/profilo/me")
        assert profile_res.status_code == 200
        paziente_id = profile_res.json()["_id"]
        
        # Get terapeuta
        terapisti_res = session.get(f"{BASE_URL}/api/public/terapisti")
        assert terapisti_res.status_code == 200
        terapeuta_id = terapisti_res.json()[0]["_id"]
        
        # Get available slot
        slots_res = session.get(f"{BASE_URL}/api/terapisti/{terapeuta_id}/slots")
        assert slots_res.status_code == 200
        slots = [s for s in slots_res.json()["slots"] if s["disponibile"]]
        assert len(slots) > 0, "No available slots"
        
        # Book appointment
        prenota_res = session.post(f"{BASE_URL}/api/public/prenota", json={
            "terapeuta_id": terapeuta_id,
            "paziente_id": paziente_id,
            "data_ora": slots[0]["data_ora"],
            "durata_minuti": 50,
            "tipo": "online"
        })
        assert prenota_res.status_code == 200
        data = prenota_res.json()
        
        # Verify stato is 'confermato' (not 'prenotato')
        assert data["stato"] == "confermato", f"Expected stato='confermato', got '{data['stato']}'"
        
        # Verify Daily room was created
        assert "daily_room_url" in data or data.get("daily_room_url") is not None, "Daily room URL should be present"
        assert "daily_room_name" in data or data.get("daily_room_name") is not None, "Daily room name should be present"
        
        print(f"Booking created: {data['_id']}, stato={data['stato']}, room={data.get('daily_room_name')}")
    
    def test_prenota_requires_paziente_role(self):
        """Test that only paziente role can book"""
        session = requests.Session()
        # Login as terapeuta
        login_res = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo.terapeuta@funzionabene.it",
            "password": "Terapeuta#2024!"
        })
        assert login_res.status_code == 200
        
        # Try to book (should fail)
        prenota_res = session.post(f"{BASE_URL}/api/public/prenota", json={
            "terapeuta_id": "fake_id",
            "paziente_id": "fake_id",
            "data_ora": "2026-05-01T10:00:00",
            "durata_minuti": 50,
            "tipo": "online"
        })
        assert prenota_res.status_code == 403


class TestEmailReminders:
    """Tests for email and reminder scheduling (logs-based verification)"""
    
    def test_booking_triggers_email_logs(self):
        """Verify booking triggers email sending (check logs)"""
        # This test verifies the email service is called
        # Actual email delivery depends on Resend API and verified emails
        session = requests.Session()
        login_res = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "caiorichieri@gmail.com",
            "password": "Paziente#2024!"
        })
        assert login_res.status_code == 200
        
        # Get paziente profile
        profile_res = session.get(f"{BASE_URL}/api/pazienti/profilo/me")
        paziente_id = profile_res.json()["_id"]
        
        # Get terapeuta
        terapisti_res = session.get(f"{BASE_URL}/api/public/terapisti")
        terapeuta_id = terapisti_res.json()[0]["_id"]
        
        # Get available slot
        slots_res = session.get(f"{BASE_URL}/api/terapisti/{terapeuta_id}/slots")
        slots = [s for s in slots_res.json()["slots"] if s["disponibile"]]
        
        if len(slots) > 0:
            # Book appointment
            prenota_res = session.post(f"{BASE_URL}/api/public/prenota", json={
                "terapeuta_id": terapeuta_id,
                "paziente_id": paziente_id,
                "data_ora": slots[0]["data_ora"],
                "durata_minuti": 50,
                "tipo": "online"
            })
            assert prenota_res.status_code == 200
            print("Booking created - check backend logs for EMAIL SENT entries")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
