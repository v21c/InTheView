import json
import sys
import asyncio
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
from dotenv import load_dotenv
import os

# KoGPT2 모델 로딩 시도
try:
    from transformers import GPT2LMHeadModel, GPT2Tokenizer

    kogpt2_tokenizer = GPT2Tokenizer.from_pretrained('skt/kogpt2-base-v2', bos_token='</s>', eos_token='</s>', pad_token='<pad>')
    kogpt2_model = GPT2LMHeadModel.from_pretrained('skt/kogpt2-base-v2')
    print("KoGPT2 model loaded successfully")
    use_kogpt2 = True
except Exception as e:
    print(f"Failed to load KoGPT2 model: {str(e)}")
    use_kogpt2 = False

# Load environment variables
load_dotenv()
URI = os.getenv("MONGO_URI")
client = MongoClient(URI, server_api=ServerApi('1'))
db = client['dev']
messages_collection = db['messages']
sessions_collection = db['sessions']

def get_messages_by_session_id(session_id):
    messages = messages_collection.find({"sessionId": ObjectId(session_id)})
    return list(messages)

def kogpt2_summarize(text):
    if not use_kogpt2:
        return "요약 기능을 사용할 수 없습니다."

    try:
        input_ids = kogpt2_tokenizer.encode(f"다음 텍스트를 한 문장으로 요약하세요: {text}\n요약:", return_tensors='pt')
        output = kogpt2_model.generate(input_ids, max_length=50, num_return_sequences=1, no_repeat_ngram_size=2, top_k=50, top_p=0.95, temperature=0.7)
        summary = kogpt2_tokenizer.decode(output[0], skip_special_tokens=True)
        return summary.split("요약:")[-1].strip()
    except Exception as e:
        print(f"Error in kogpt2_summarize: {str(e)}")
        return "요약 중 오류가 발생했습니다."

def summarize_session(session_id):
    messages = get_messages_by_session_id(session_id)
    if not messages:
        return "No messages found for this session."

    full_conversation = " ".join([msg.get("question", "") + " " + msg.get("answer", "") for msg in messages])
    return kogpt2_summarize(full_conversation)

async def update_session_name(session_id, summary):
    sessions_collection.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"sessionName": summary}}
    )

async def check_and_summarize(session_id):
    messages = get_messages_by_session_id(session_id)
    if len(messages) > 3 and len(messages) % 4 == 0:
        summary = summarize_session(session_id)
        await update_session_name(session_id, summary)
        return summary
    return None

async def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Session ID not provided"}, ensure_ascii=False))
        sys.exit(1)

    session_id = sys.argv[1]
    try:
        summary = await check_and_summarize(session_id)
        result = {
            "summary": summary,
            "updated": summary is not None
        }
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(main())