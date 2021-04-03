from flask import request, render_template, redirect, url_for, jsonify
from app import app
from pywebpush import webpush
import json
from urllib.parse import urlparse
import time

users = {}

def send_web_push(subscriptionToken, message):
    """
        Send push notification to the push server
    """
    return webpush(
        subscription_info = subscriptionToken,
        data              = message,
        vapid_claims      = {
                                "sub": "mailto:alex@example.org",
                                "aud": '{uri.scheme}://{uri.netloc}'.format(uri=urlparse(subscriptionToken['endpoint'])),
                                "exp": time.time()+300
                            },
        vapid_private_key = app.config.get('VAPID_PRIVATE_KEY')
    )


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'GET':
        return render_template('index.html')
    else:
        username = request.form.get('username')
        global users
        users[username] = None
        return redirect(url_for('home', username=username))


@app.route('/home')
def home():
    username = request.args.get('username')
    return render_template('home.html', username=username)


@app.route('/notify')
def notify():
    return render_template('notify.html')


@app.route('/send')
def send():
    recipient = request.args.get('recipient')

    global users
    recipient = users.get(recipient, None)

    print(recipient)

    if recipient:
        push = send_web_push(recipient, 'You have a new notification')

        print(push)

        return jsonify(success=True, message="Notified")
    else:
        return jsonify(success=False, message="Recipient not found.")


@app.route('/subscribe', methods=['GET', 'POST'])
def subscribe():
    if request.method == 'GET':
        return app.config.get('VAPID_PUBLIC_KEY')

    else:
        message = 'User subscription successful'
        subscriptionToken = json.loads(request.json['subToken'])
        username = request.json['username']

        print(f'subscription recieved from { username }')

        global users
        users[username] = subscriptionToken

        send_web_push(subscriptionToken, message)
        return jsonify(success=True)