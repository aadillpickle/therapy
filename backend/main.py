from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import json
from dotenv import load_dotenv
from posthog import Posthog

            
from prompts import therapy_prompt
from audio import get_audio_from_text
from db import USERS, PROMPTS
from passkeys import PASSKEYS

import os
import openai

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
posthog = Posthog(project_api_key=os.environ.get('POSTHOG_API_KEY'), host='https://app.posthog.com')

app = Flask(__name__)
CORS(app)

PORT = os.environ.get('PORT', 8000)

VALID_PASSKEYS = list(PASSKEYS.keys())
COST_PER_TOKEN = 0.000002

def delete_user_message_history(passkey: str):
  USERS.find_one_and_update({'passkey': passkey},
      {
          '$set': {'message_history': []}
      }
  )

def therapy(passkey, user_input: dict, message_history: list):
  if message_history == []:
    message_history.append({"role": "system", "content": therapy_prompt()})
  user_input = {"role": "user", "content": user_input}
  message_history.append(user_input)

  completion = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=message_history,
    max_tokens=123,
  )

  response = completion.choices[0].message.content
  usage = completion.usage["total_tokens"]
  print(completion.usage)
  therapist_response = {"role": "assistant", "content": response}
  message_history.append(therapist_response)
  store_usage(passkey, usage, [user_input, therapist_response])
  posthog.capture(passkey, 'chat message')
  return {"therapist_response": response, "message_history": message_history}

def store_usage(passkey: str, token_amount: int, new_messages: list):  
    
    USERS.find_one_and_update({'passkey': passkey},
        {
            '$push': {'message_history': new_messages},
            '$inc': {'token_usage': token_amount, 'total_cost': token_amount * COST_PER_TOKEN}
        },
        upsert=True
    )
    
@app.route('/', methods=['GET'])
def index():
	return '<h1>Server is running</h1>'

@app.route('/therapize', methods=['POST'])
def create_user_route():
  #Sample response attributes
  response_object = {}
  mimetype="application/json"
  status = 0

  try:
    
    #Parse json request
    req_json = request.get_json()
    input = req_json['input']
    message_history = req_json['message_history']
    passkey = req_json['passkey']
    
    if passkey in VALID_PASSKEYS:
      response_object["message"] = therapy(passkey, input, message_history)
    else:
      raise Exception("Invalid password")

    status = 200
  except Exception as e:
    response_object["message"] = f"Server error: {e}"
    status = 400

  return Response(
    json.dumps(response_object),
    status=status,
    mimetype=mimetype
  )

@app.route('/validate-passkey', methods=['POST'])
def validate_passkey_route():
  #Sample response attributes
  response_object = {}
  mimetype="application/json"
  status = 0

  try:
    #Parse json request
    req_json = request.get_json()
    print(req_json)
    passkey = req_json['passkey']
    
    #extract anonymous id from posthog cookie
    # posthog_cookie = request.cookies.get('ph_')
    if passkey in VALID_PASSKEYS:
      posthog.capture(passkey, 'validated')
      response_object["message"] = "Valid passkey"
    else:
      raise Exception("Invalid passkey")

    status = 200
  except Exception as e:
    response_object["message"] = f"Server error: {e}"
    status = 400

  return Response(
    json.dumps(response_object),
    status=status,
    mimetype=mimetype
  )

@app.route('/delete-all-data', methods=['POST'])
def delete_all_data_route():
  #Sample response attributes
  response_object = {}
  mimetype="application/json"
  status = 0

  try:
    #Parse json request
    req_json = request.get_json()
    print(req_json)
    passkey = req_json['passkey']
    
    #extract anonymous id from posthog cookie
    # posthog_cookie = request.cookies.get('ph_')
    if passkey in VALID_PASSKEYS:
      posthog.capture(passkey, 'deleted chat data')
      delete_user_message_history(passkey)
      response_object["message"] = "Deleted all data"
    else:
      raise Exception("Invalid passkey")

    status = 200
  except Exception as e:
    response_object["message"] = f"Server error: {e}"
    status = 400

  return Response(
    json.dumps(response_object),
    status=status,
    mimetype=mimetype
  )

@app.route('/message-history', methods=['POST'])
def message_history_route():
  #Sample response attributes
  response_object = {}
  mimetype="application/json"
  status = 0

  try:
    #Parse json request
    req_json = request.get_json()
    print(req_json)
    passkey = req_json['passkey']
    
    #extract anonymous id from posthog cookie
    # posthog_cookie = request.cookies.get('ph_')
    if passkey in VALID_PASSKEYS:
      posthog.capture(passkey, 'retrieved chat data')
      user = USERS.find_one({'passkey': passkey})
      response_object["message"] = user['message_history'][-1:]#last 20
    else:
      raise Exception("Invalid passkey")

    status = 200
  except Exception as e:
    response_object["message"] = f"Server error: {e}"
    status = 400

  return Response(
    json.dumps(response_object),
    status=status,
    mimetype=mimetype
  )

@app.route('/get-audio', methods=['POST'])
def get_audio():
  status = 0
  try:
    #Parse json request
    req_json = request.get_json()
    print(req_json)
    text = req_json['text']
    audio_data = get_audio_from_text(text)

    status = 200
    return Response(audio_data, status=status, content_type='audio/mpeg')
  except Exception as e:
    status = 400
    print(e)
    return Response(f"Server error: {e}", status=status)
    
  

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=PORT, debug=True)
