from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import stripe

import json
from dotenv import load_dotenv
from posthog import Posthog
from therapist import create_new_user, therapize, add_email_and_credits
from db import USERS, PROMPTS, delete_user_message_history, store_usage, add_credits

import os
import openai

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
posthog = Posthog(project_api_key=os.environ.get('POSTHOG_API_KEY'), host='https://app.posthog.com')

app = Flask(__name__)
CORS(app)

PORT = os.environ.get('PORT', 8000)

@app.route('/', methods=['GET'])
def index():
	return '<h1>Server is running</h1>'

@app.route('/therapize', methods=['POST'])
def therapize_route():
  response_object = {}
  mimetype="application/json"
  status = 0

  try:
    #Parse json request
    req_json = request.get_json()
    email = req_json['email'] if 'email' in req_json else None
    input = req_json['input'] if 'input' in req_json else None
    message_history = req_json['message_history']
    ip = request.environ.get('HTTP_X_FORWARDED_FOR') if 'HTTP_X_FORWARDED_FOR' in request.environ else request.headers.get('X-Forwarded-For')
    if input == "":
       raise Exception("Input cannot be empty. Please try again.")
    if email:
        user = USERS.find_one({"email": email})
        if user:
          if user["credits"] > 0:
            resp_msg, msg_hist, token_amount, conversation = therapize(input, message_history) #err here
            store_usage(token_amount, conversation, email=email)
            response_object["message"] = {"therapist_response": resp_msg, "message_history": msg_hist}  
            status = 200
            posthog.capture(email, 'chat message')
            return Response(
              json.dumps(response_object),
              status=status,
              mimetype=mimetype
          )
          else:
            status = 402
            raise Exception("Not enough credits")
            
    user = USERS.find_one({"ip": ip})
    

    if not user:
      user = create_new_user(ip, email)

    if email and not user.get("email"):
        user = add_email_and_credits(user, email)

    if user["credits"] > 0:
        resp_msg, msg_hist, token_amount, conversation = therapize(input, message_history)
        store_usage(token_amount, conversation, ip=ip)
        response_object["message"] = {"therapist_response": resp_msg, "message_history": msg_hist}
        status = 200
        posthog.capture(ip, 'chat message')
        return Response(
          json.dumps(response_object),
          status=status,
          mimetype=mimetype
        )
    else:
      status = 402
      raise Exception("Not enough credits. Please make an account for 10 more free credits or log in if you already have an account.")


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
    email = req_json['email']
    
    posthog.capture(email, 'deleted chat data')
    delete_user_message_history(email)
    response_object["message"] = "Deleted all data"

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
    email = req_json['email']
    posthog.capture(email, 'retrieved chat data')
    user = USERS.find_one({'email': email})
    response_object["message"] = user['message_history'][-1:]
    status = 200
  except Exception as e:
    response_object["message"] = f"Server error: {e}"
    status = 400

  return Response(
    json.dumps(response_object),
    status=status,
    mimetype=mimetype
  )

@app.route('/credits', methods=['POST'])
def credits_route():
  #Sample response attributes
  response_object = {}
  mimetype="application/json"
  status = 0

  try:
    #Parse json request
    req_json = request.get_json()
    email = req_json['email']
    user = USERS.find_one({'email': email})
    response_object["message"] = user['credits']
    status = 200
  except Exception as e:
    response_object["message"] = f"Server error: {e}"
    status = 400

  return Response(
    json.dumps(response_object),
    status=status,
    mimetype=mimetype
  )

@app.route('/webhook', methods=['POST'])
def webhook():
    payload = request.data
    sig_header = request.headers.get('stripe-signature')
    event = None

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET"))
    except ValueError as e:
        # Invalid payload
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return 'Invalid signature', 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        customer_email = session["customer_details"]["email"]
        user = add_credits(customer_email)
        posthog.capture(customer_email, 'purchased credits')
        print(user["credits"])
        
    return 'Success', 200

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=PORT, debug=True)
