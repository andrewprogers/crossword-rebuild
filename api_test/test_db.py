import pytest
from api.database import get_db_session

def test_get_db_only_in_context(app):
    with pytest.raises(RuntimeError) as e:
        get_db_session()
    assert "Working outside of application context" in str(e.value)

def test_db_unique_in_context(app):
    with app.app_context():
        with get_db_session() as db1:
            with get_db_session() as db2:
                assert db1 is db2