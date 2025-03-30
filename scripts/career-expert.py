from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

API_TITLE = "Career Guidance API"
API_DESCRIPTION = "API for career guidance powered by Google Gemini 2.0 Flash"
API_VERSION = "1.0.0"

GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.0-flash"

CAREER_GUIDANCE_PROMPT = """
You are a career guidance expert with deep knowledge of various industries, job markets, education paths, and professional development. 
Respond to career-related questions with:
- Brief, actionable advice
- Concise bullet points for key information
- Short paragraphs when necessary (max 3-4 sentences)
- Practical next steps
- Information about relevant skills, education, and job prospects

Keep responses focused, practical, and avoid lengthy theoretical explanations.
Always prioritize clarity and brevity over comprehensive coverage.
"""

class QueryRequest(BaseModel):
    query: str = Field(..., description="User's career-related query")

class GuidanceResponse(BaseModel):
    response: str = Field(..., description="Career guidance advice")

genai.configure(api_key=GEMINI_API_KEY)

def get_gemini_response(query: str):
    """Get career guidance response from Gemini model"""
    if not GEMINI_API_KEY:
        return "Error: Gemini API key not configured. Please set the GOOGLE_GEMINI_API_KEY environment variable."
    
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        chat = model.start_chat(history=[
            {"role": "user", "parts": ["Please act according to these instructions: " + CAREER_GUIDANCE_PROMPT]},
            {"role": "model", "parts": ["I'll act as a career guidance expert, providing concise, practical advice with bullet points and short paragraphs. I'll focus on actionable insights and avoid lengthy explanations."]}
        ])
        
        response = chat.send_message(query)
        return response.text
        
    except Exception as e:
        return f"Error generating response: {str(e)}"

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/guidance", response_model=GuidanceResponse)
async def get_career_guidance(request: QueryRequest):
    """Get career guidance based on user query"""
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    response = get_gemini_response(request.query)
    return GuidanceResponse(response=response)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("llm:app", host="0.0.0.0", port=8000, reload=True)