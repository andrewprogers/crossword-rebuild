from api import create_app

def test_config(test_config):
    assert not create_app().testing
    assert create_app(test_config).testing
