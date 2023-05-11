import os
from pymongo import MongoClient
import json
from bson.json_util import dumps as bson_dumps
from typing import Optional

uri = os.environ.get("MONGO_DB_URI")
client = MongoClient(uri,
                     connectTimeoutMS=30000,
                     socketTimeoutMS=None)
db = client.Cluster0
USERS = db.Users
PROMPTS = db.Prompts

COST_PER_TOKEN = 0.000002

def parse_json(data):
    return json.loads(bson_dumps(data))

def delete_user_message_history(email: str):
  USERS.find_one_and_update({'email': email},
      {
          '$set': {'message_history': [], "summary": ""}
      }
  )

def store_usage(token_amount: int, new_messages: list, email: Optional[str] = None, ip: Optional[str] = None):  
    if email:
        USERS.find_one_and_update({'email': email},
            {
                '$inc': {'credits': -1, 'token_usage': token_amount, 'total_cost': token_amount * COST_PER_TOKEN},
                '$push': {'message_history': new_messages}
            }
        )
    elif ip:
        USERS.find_one_and_update({'ip': ip},
            {
                '$inc': {'credits': -1, 'token_usage': token_amount, 'total_cost': token_amount * COST_PER_TOKEN},
                '$push': {'message_history': new_messages}
            }
        )
    else:
        raise Exception("No email or ip provided")

def add_credits(customer_email: str):
    user = USERS.find_one_and_update({"email": customer_email}, {"$inc": {"credits": 100}})
    return user