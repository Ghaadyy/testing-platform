import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from flask import jsonify

SECRET_KEY = "averyveryverylongsecretthatshouldnotbeusedinproduction"

def authorize(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"msg": "Token is missing"}), 401

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.decoded_token = decoded_token 
            return f(*args, **kwargs)
        except ExpiredSignatureError:
            return jsonify({"msg": "Token has expired"}), 401
        except InvalidTokenError:
            return jsonify({"msg": "Invalid token"}), 401

    return decorator