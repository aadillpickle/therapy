from flask import Flask, request, Response
from flask_cors import CORS
import json
from dotenv import load_dotenv

import os
load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = os.environ.get('PORT', 8000)

@app.route('/', methods=['GET'])
def index():
	return '<h1>Server is running</h1>'

@app.route('/sample-endpoint', methods=['POST'])
def create_user_route():
  #Sample response attributes
  response_object = {}
  mimetype="application/json"
  status = 0

  try:
    #Parse json request
    req_json = request.get_json()
    param = req_json['param']
    
    response_object["message"] = "success"

    status = 200
  except Exception as e:
    response_object["message"] = "Server error"
    status = 400

  return Response(
    json.dumps(response_object),
    status=status,
    mimetype=mimetype
  )

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=PORT, debug=True)
