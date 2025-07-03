from fastapi import FastAPI, WebSocket
from fastapi.responses import JSONResponse
import json
from openai import AsyncOpenAI
import os
import traceback 
import base64
from dotenv import load_dotenv
load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()


@app.get("/")
async def health_check():
    return JSONResponse(content={"status": "ok", "message": "AI Service running"})


@app.websocket("/ws/ai")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ WebSocket connection accepted")
    
    while True:
        try:
            raw = await websocket.receive_text()
            print("📩 Received message:", raw)

            message = json.loads(raw)
            msg_type = message.get("type")

            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue

            elif msg_type == "snapshot":
                snapshot = message["content"]
                print("🧩 Snapshot received:", json.dumps(snapshot, indent=2)[:300])  # 可加 max length

                prompt = build_prompt_from_snapshot(snapshot)
                print("📜 Built prompt:\n", prompt[:500])  

                response = await call_openai_chat(prompt)

                print("🧠 OpenAI returned:", response)

                await websocket.send_text(json.dumps({
                    "type": "response",
                    "content": response,
                }))

            elif msg_type == "transcribe_audio":
                base64_audio = message["content"]["audio_base64"]
                mime_type = message["content"].get("mime_type", "audio/webm")

                print("🔊 Received audio (base64, truncated):", base64_audio[:100])

                transcript = await call_openai_whisper(base64_audio, mime_type)

                await websocket.send_text(json.dumps({
                    "type": "transcribe_audio_result",
                    "content": {
                        "transcript": transcript,
                    },
                }))

            else:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "content": f"Unknown message type: {msg_type}",
                }))

        except Exception as e:
            print(f"❌ WebSocket error: {e}")
            traceback.print_exc()
            try:
                await websocket.close()
            except:
                pass
            break


async def call_openai_chat(prompt: str) -> str:
    try:
        print("🚀 Calling OpenAI Chat API...")

        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes UI components."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300,
        )

        print("✅ OpenAI call succeeded")
        return response.choices[0].message.content.strip()

    except Exception as e:
        print("❌ OpenAI API Error:", e)
        import traceback
        traceback.print_exc()
        return "Failed to generate response."
    
async def call_openai_whisper(base64_audio: str, mime_type: str) -> str:
    try:
        print("🌀 Decoding audio...")
        audio_bytes = base64.b64decode(base64_audio)

        print("🎙️ Calling OpenAI Whisper API...")
        response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=( "recording." + mime_type.split("/")[-1], audio_bytes, mime_type ),
            response_format="json"
        )
        return response.text.strip()
    except Exception as e:
        print("❌ Whisper API Error:", e)
        traceback.print_exc()
        return "Failed to transcribe audio."

def build_prompt_from_snapshot(snapshot: dict) -> str:
    container_id = snapshot.get("id")
    rect = snapshot.get("containerRect", {})
    children = snapshot.get("childrenSummary", [])

    container_box = (
        f"The container is located at (x={rect.get('x')}, y={rect.get('y')}), "
        f"with width={rect.get('width')} and height={rect.get('height')}."
    )

    if not children:
        return (
            f"{container_box}\n"
            "There are no visible child elements. "
            "Please describe what kind of UI component this container might be."
        )

    summary_lines = []
    for child in children[:5]:
        styles = child.get("computedStyle", {})
        summary_lines.append(
            f"- <{child['tag']}> with classes: {', '.join(child['classList'])}; "
            f"text: \"{child.get('textContent', '').strip()}\"; "
            f"color: {styles.get('color')}, background: {styles.get('backgroundColor')}"
        )

    summary = "\n".join(summary_lines)

    prompt = (
        f"{container_box}\n\n"
        f"It includes the following child elements:\n"
        f"{summary}\n\n"
        f"Please describe in 1-2 sentences what kind of UI component this is and what it might be used for. "
        f"Be concise and avoid guessing if the information is insufficient."
    )

    return prompt
