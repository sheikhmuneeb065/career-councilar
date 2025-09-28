"""Database initialization with a dev fallback.

If a Firebase service account JSON is present and valid we use Firestore. Otherwise the
code falls back to a simple local JSON file store so the backend can run in dev without
cloud credentials.
"""
import os
import json
from pathlib import Path

USE_FIRESTORE = False
db = None

# Try to initialize Firestore using a firebase_key.json in the backend folder
try:
	import firebase_admin
	from firebase_admin import credentials, firestore

	BASE_DIR = Path(__file__).resolve().parent
	cred_path = BASE_DIR / "firebase_key.json"
	if cred_path.exists():
		cred = credentials.Certificate(str(cred_path))
		firebase_admin.initialize_app(cred)
		db = firestore.client()
		USE_FIRESTORE = True
	else:
		USE_FIRESTORE = False
except Exception:
	# Any import/initialization error -> fall back to local store
	USE_FIRESTORE = False

# Local JSON fallback store path
BASE_DIR = Path(__file__).resolve().parent
LOCAL_STORE = BASE_DIR / "local_store.json"

def read_local_store():
	if not LOCAL_STORE.exists():
		return {}
	try:
		with open(LOCAL_STORE, "r", encoding="utf-8") as f:
			return json.load(f)
	except Exception:
		return {}

def write_local_store(data: dict):
	with open(LOCAL_STORE, "w", encoding="utf-8") as f:
		json.dump(data, f, ensure_ascii=False, indent=2)

