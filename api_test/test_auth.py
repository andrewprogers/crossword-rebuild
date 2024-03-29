import pytest
import authlib

def test_login_redirect(client):
    res = client.get('/auth/login')
    assert res.status_code == 302


def test_mock_oauth(client, monkeypatch):
    # monkeypatch.setattr("authlib.integrations.flask_client.OAuth", PatchOauth)
    res = client.post('/auth/callback')

