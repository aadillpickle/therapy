import os
from pymongo import MongoClient
import json
from bson.json_util import dumps as bson_dumps

uri = os.environ.get("MONGO_DB_URI")
client = MongoClient(uri,
                     connectTimeoutMS=30000,
                     socketTimeoutMS=None)
db = client.Cluster0
USERS = db.Users
PROMPTS = db.Prompts

def parse_json(data):
    return json.loads(bson_dumps(data))
