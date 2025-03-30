import requests
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
import google.generativeai as genai
import logging
import random
import numpy as np
import os 
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware  

load_dotenv()

logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("job_finder")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

job_database = []

app = FastAPI(title="Job Finder API", 
              description="An API for finding and analyzing job listings")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobListing(BaseModel):
    title: str
    company: str
    location: str
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Full Stack Developer",
                "company": "TechCorp",
                "location": "Bangalore",
            }
        }

class QueryRequest(BaseModel):
    query: str
    location: str = ""
    num_results: int = Field(10, ge=1, le=20)

class JobResponse(BaseModel):
    query: str
    location: str
    retrieved_jobs: List[Dict[str, Any]]
    gemini_response: str

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0"
]

def generate_random_embedding(size=768):
    """Generate a random normalized embedding vector for fallback"""
    vector = np.random.normal(0, 1, size)
    return (vector / np.linalg.norm(vector)).tolist()

def get_embedding(text: str) -> List[float]:
    """Get embedding using Gemini API"""
    try:
        response = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="semantic_similarity",
        )
        return response["embedding"]
    except Exception as e:
        logger.error(f"Error getting embedding: {e}")
        return generate_random_embedding()

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    dot_product = sum(x * y for x, y in zip(a, b))
    magnitude_a = sum(x * x for x in a) ** 0.5
    magnitude_b = sum(x * x for x in b) ** 0.5
    
    if magnitude_a == 0 or magnitude_b == 0:
        return 0
    
    return dot_product / (magnitude_a * magnitude_b)

def search_jobs(query: str, top_k: int = 10) -> List[Dict[str, Any]]:
    """Search jobs using vector similarity"""
    if not job_database:
        return []
        
    query_embedding = get_embedding(query)
    
    results = []
    for job in job_database:
        combined_text = f"Title: {job['title']}. Company: {job['company']}. Location: {job['location']}"
        job_embedding = get_embedding(combined_text)
        similarity = cosine_similarity(query_embedding, job_embedding)
        results.append((similarity, job))
    
    results.sort(key=lambda x: x[0], reverse=True)
    return [job for _, job in results[:top_k]]

def scrape_jobs_from_indeed(query: str, location: str = "", num_jobs: int = 10) -> List[Dict[str, Any]]:
    """Scrape job listings from Indeed.com"""
    query_param = query.replace(" ", "+")
    location_param = location.replace(" ", "+") if location else ""
    
    url = f"https://www.indeed.com/jobs?q={query_param}&l={location_param}"
    
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "DNT": "1"
    }
    
    try:
        logger.info(f"Scraping Indeed jobs from: {url}")
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        job_cards = soup.select("div.job_seen_beacon")
        logger.info(f"Found {len(job_cards)} job cards on Indeed")
        
        jobs = []
        for card in job_cards[:num_jobs]:
            try:
                title_elem = card.select_one("h2.jobTitle span")
                title = title_elem.get_text(strip=True) if title_elem else "N/A"
                
                company_elem = card.select_one("span.companyName")
                company = company_elem.get_text(strip=True) if company_elem else "N/A"
                
                location_elem = card.select_one("div.companyLocation")
                location_text = location_elem.get_text(strip=True) if location_elem else "N/A"
                
                job = {
                    "title": title,
                    "company": company,
                    "location": location_text
                }
                
                jobs.append(job)
                logger.info(f"Extracted job from Indeed: {title} at {company}")
                
            except Exception as e:
                logger.error(f"Error extracting Indeed job details: {e}")
                continue
                
        return jobs
        
    except Exception as e:
        logger.error(f"Error fetching Indeed jobs: {e}")
        return []

def scrape_jobs_from_linkedin(query: str, location: str = "", num_jobs: int = 10) -> List[Dict[str, Any]]:
    """Scrape job listings from LinkedIn"""
    query_param = query.replace(" ", "%20")
    location_param = location.replace(" ", "%20") if location else ""
    
    url = f"https://www.linkedin.com/jobs/search?keywords={query_param}&location={location_param}"
    
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "DNT": "1"
    }
    
    try:
        logger.info(f"Scraping LinkedIn jobs from: {url}")
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        job_cards = soup.select("div.base-search-card")
        logger.info(f"Found {len(job_cards)} job cards on LinkedIn")
        
        jobs = []
        for card in job_cards[:num_jobs]:
            try:
                title_elem = card.select_one("h3.base-search-card__title")
                title = title_elem.get_text(strip=True) if title_elem else "N/A"
                
                company_elem = card.select_one("h4.base-search-card__subtitle")
                company = company_elem.get_text(strip=True) if company_elem else "N/A"
                
                location_elem = card.select_one("span.job-search-card__location")
                location_text = location_elem.get_text(strip=True) if location_elem else "N/A"
                
                job = {
                    "title": title,
                    "company": company,
                    "location": location_text
                }
                
                jobs.append(job)
                logger.info(f"Extracted job from LinkedIn: {title} at {company}")
                
            except Exception as e:
                logger.error(f"Error extracting LinkedIn job details: {e}")
                continue
                
        return jobs
        
    except Exception as e:
        logger.error(f"Error fetching LinkedIn jobs: {e}")
        return []

def call_gemini_llm(prompt: str) -> str:
    """Get insights from Gemini model"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        return response.text if hasattr(response, 'text') else str(response)
    except Exception as e:
        logger.error(f"Error calling Gemini: {e}")
        return f"Error getting insights: {str(e)}"

def add_jobs_to_database(jobs: List[Dict[str, Any]]) -> None:
    """Add jobs to the database"""
    global job_database
    
    for job in jobs:
        if not any(
            existing.get('title') == job.get('title') and 
            existing.get('company') == job.get('company')
            for existing in job_database
        ):
            job_database.append(job)

def generate_insights(query: str, jobs: List[Dict[str, Any]]) -> str:
    """Generate insights for the given jobs"""
    if not jobs:
        return "No relevant jobs found to analyze."
        
    context = "\n".join([
        f"{i+1}. {job['title']} at {job['company']} ({job['location']})"
        for i, job in enumerate(jobs)
    ])
    
    prompt = (
        f"Query: {query}\n\n"
        f"Listings:\n{context}\n\n"
        "Based on these job listings, provide exactly 5 frequently asked questions (FAQs) that job seekers might have about these positions. "
        "Number each question from 1-5 and provide a concise answer for each. "
        "Don't include any introduction or conclusion, just the 5 FAQs in a clear numbered format.\n\n"
    )
    
    return call_gemini_llm(prompt)

def process_jobs_background(jobs: List[Dict[str, Any]]) -> None:
    """Process jobs in background to improve API response time"""
    add_jobs_to_database(jobs)

@app.post("/retrieve_jobs", response_model=JobResponse)
async def retrieve_jobs_endpoint(request: QueryRequest, background_tasks: BackgroundTasks):
    try:
        indeed_jobs = scrape_jobs_from_indeed(request.query, request.location, request.num_results)
        linkedin_jobs = scrape_jobs_from_linkedin(request.query, request.location, request.num_results)
        
        all_jobs = indeed_jobs + linkedin_jobs
        
        if not all_jobs:
            raise HTTPException(status_code=404, detail=f"No jobs found for '{request.query}' in '{request.location or 'any location'}'")
        
        background_tasks.add_task(process_jobs_background, all_jobs)
        
        add_jobs_to_database(all_jobs)
        
        relevant_jobs = search_jobs(request.query, request.num_results) if job_database else all_jobs[:request.num_results]
        
        insights = generate_insights(request.query, relevant_jobs)
        
        return {
            "query": request.query,
            "location": request.location,
            "retrieved_jobs": relevant_jobs,
            "gemini_response": insights
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in retrieve_jobs_endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
def health_check():
    """API health check endpoint"""
    return {"status": "healthy", "job_count": len(job_database)}

@app.get("/")
def root():
    """Root endpoint with basic instructions"""
    return {
        "message": "Job Finder API is running",
        "usage": "POST to /retrieve_jobs with a JSON body containing 'query' and optional 'location'",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Job Finder API...")
    uvicorn.run(app, host="0.0.0.0", port=8000)