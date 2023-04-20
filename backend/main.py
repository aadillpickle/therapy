from flask import Flask, request, Response
from flask_cors import CORS
import json
from dotenv import load_dotenv
from posthog import Posthog

            
from prompts import therapy_prompt
from db import USERS, PROMPTS

import os
import openai

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
posthog = Posthog(project_api_key=os.environ.get('POSTHOG_API_KEY'), host='https://app.posthog.com')

app = Flask(__name__)
CORS(app)

PORT = os.environ.get('PORT', 8000)

VALID_PASSKEYS = [
  'gavin-hinata-trisolaris-goldigger',
  'erlich-neji-wilderness-telegraph',
  'hooli-konoha-waterdrop-graduation',
  'bighead-kurama-ether-redbone',
  'nelson-akatsuki-cosmicrays-bonfire',
  'raviga-kakashi-lighttomb-late',
  'monica-hall-ramen-heartbreak',
  'actionjack-kage-sophons-saintpablo',
  'guilfoyle-shikamaru-blackdomain-ye',
  'jared-shuriken-galactic-awaken',
  'piedpiper-orochimaru-photons-stronger',
  'aviato-sakura-droplet-flashlight',
  'endframe-ino-crisisera-college',
  'middleout-choji-darkforest-cudi',
  'nucleus-gaara-spacetime-wolves',
  'hoverboard-kisame-redcoast-famous',
  'yinyang-temari-tesseract-champion',
  'platform-tenten-threebody-goodlife',
  'atlanta-sarutobi-solarwave-bound',
  'disrupt-sasuke-dimension-shift',
  'compression-zabuza-gravitational-waves',
  'bream-hall-rocklee-tauzero',
  'laflamme-uzumaki-galacticraft-fatherstretch',
  'edchambers-kiba-curtainspace-bloodonleaves',
  'decentralized-kankuro-sunspot-ultralightbeam',
  'fooman-minato-axioms-diamonds',
  'techcrunch-naruto-halointerpreter-spaceship',
  'laurie-anko-evaporatingriver-lowlights',
  'carver-hyuga-microuniverse-mrwest',
  'chuyan-woodstyle-lostinspace-mercy'
]

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

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=PORT, debug=True)
