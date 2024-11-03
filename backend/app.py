from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from functools import wraps
from cachetools import TTLCache
import time
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://1649-213-230-92-221.ngrok-free.app"}})
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
Base = declarative_base()

db = SQLAlchemy(app)
cache = TTLCache(maxsize=1000, ttl=300)


class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=True)
    coins = Column(Integer, default=0)
    level = Column(String, default='Bronze')
    invited_frens = Column(Integer, default=0)
    invited_by = Column(Integer, ForeignKey('users.user_id'), nullable=True)

def init_db():
    with app.app_context():
        db.create_all()

def db_operation(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Database integrity error"}), 500
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    return decorated_function

@app.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    cached_user = cache.get(f'user_{user_id}')
    if cached_user:
        return jsonify(cached_user)

    user = User.query.get(user_id)
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = {
        'user_id': user.user_id,
        'username': user.username,
        'coins': user.coins,
        'level': user.level,
        'invited_frens': user.invited_frens
    }
    cache[f'user_{user_id}'] = user_data
    return jsonify(user_data)

@app.route('/update_user', methods=['POST'])
@db_operation
def update_user():
    data = request.json
    user_id = data.get('user_id')
    username = data.get('username')
    invited_frens = data.get('invited_frens')
    coins = data.get('coins')
    level = data.get('level')

    user = User.query.get(user_id)
    if user is None:
        user = User(user_id=user_id)
        db.session.add(user)

    if username:
        user.username = username
    if invited_frens is not None:
        user.invited_frens = invited_frens
    if coins is not None:
        user.coins = coins
    if level:
        user.level = level

    db.session.commit()
    cache.pop(f'user_{user_id}', None)  
    return jsonify({"success": True, "message": "User data updated successfully"}), 200

@app.route('/invite_friend', methods=['POST'])
@db_operation
def invite_friend():
    data = request.json
    inviter_id = data.get('inviter_id')
    invited_id = data.get('invited_id')

    inviter = User.query.get(inviter_id)
    if inviter is None:
        return jsonify({"error": "Inviter not found"}), 404

    invited = User.query.get(invited_id)
    if invited is None:
        invited = User(user_id=invited_id, invited_by=inviter_id)
        db.session.add(invited)
    elif invited.invited_by is not None:
        return jsonify({"error": "User already invited"}), 400

    inviter.invited_frens += 1
    inviter.coins += 150 

    db.session.commit()
    cache.pop(f'user_{inviter_id}', None)
    cache.pop(f'user_{invited_id}', None)  

    return jsonify({"success": True, "message": "Friend invited successfully"}), 200

@app.route('/admin_stats', methods=['GET'])
def admin_stats():
    total_users = User.query.count()
    total_coins = db.session.query(db.func.sum(User.coins)).scalar() or 0
    return jsonify({
        "totalUsers": total_users,
        "totalBlazeCoins": total_coins
    })

if __name__ == '__main__':
    if not os.path.exists('users.db'):
        init_db()
    app.run(debug=True)