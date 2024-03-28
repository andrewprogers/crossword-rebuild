import pytest

def test_login_redirect(client):
    res = client.get('/auth/login')
    print(dir(res))
    assert res.status_code == 302