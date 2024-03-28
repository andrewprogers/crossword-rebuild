import functools
from flask import g, redirect, url_for

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user_id is None:
            return {
                "errors": ["Not Authorized"],
                "redirect_url": url_for('auth.login')
            }, 401

        return view(**kwargs)
    return wrapped_view

def redirect_if_logged_in(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user_id:
            return redirect(url_for('index'))
        return view(**kwargs)

    return wrapped_view