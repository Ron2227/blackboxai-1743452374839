# Attention Checker Backend

## API Endpoints
- `POST /saliency`: Process an image to generate saliency map
- `GET /health`: Health check endpoint

## Development
1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run locally:
```bash
uvicorn main:app --reload
```

## Deployment
### Render/Railway
1. Create a new Python service
2. Set startup command:
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```
3. Add environment variables if needed

### Environment Variables
None required for basic functionality