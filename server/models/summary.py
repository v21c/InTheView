import json
import torch
from transformers import PreTrainedTokenizerFast, BartForConditionalGeneration
import nltk
import logging
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
from dotenv import load_dotenv
import sys

load_dotenv()
nltk.download('punkt', quiet=True)
logging.getLogger("transformers").setLevel(logging.ERROR)

tokenizer = PreTrainedTokenizerFast.from_pretrained('digit82/kobart-summarization')
model = BartForConditionalGeneration.from_pretrained('digit82/kobart-summarization')

URI = "mongodb+srv://admin:admin1234@cluster0.0mfe7qt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(URI, server_api=ServerApi('1'))
db = client['dev']
messages_collection = db['messages']
sessions_collection = db['sessions']

def summarize_text_korean(text):
    inputs = tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = model.generate(
        inputs["input_ids"],
        max_length=50,
        min_length=10,
        length_penalty=0.8,
        num_beams=4,
        early_stopping=True,
        no_repeat_ngram_size=2
    )
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

def get_messages_by_session_id(session_id):
    messages = messages_collection.find({"sessionId": ObjectId(session_id)})
    return list(messages)

def summarize_session(session_id):
    messages = get_messages_by_session_id(session_id)
    if not messages:
        return "No messages found for this session."

    full_conversation = " ".join([msg.get("question", "") + " " + msg.get("answer", "") for msg in messages])
    summary = summarize_text_korean(full_conversation)
    return summary

def update_session_name(session_id, summary):
    sessions_collection.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"sessionName": summary}}
    )
    print(json.dumps({"updated": True, "summary": summary}, ensure_ascii=False))

def check_and_summarize(session_id):
    messages = get_messages_by_session_id(session_id)
    if len(messages) > 3 and len(messages) % 4 == 0:
        summary = summarize_session(session_id)
        update_session_name(session_id, summary)
        return summary
    return None

def main():
    if len(sys.argv) != 2:
        # print(json.dumps({"error": "Session ID is required"}))
        sys.exit(1)

    session_id = sys.argv[1]
    try:
        summary = check_and_summarize(session_id)
        result = {
            "summary": summary,
            "updated": summary is not None
        }
        # print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
