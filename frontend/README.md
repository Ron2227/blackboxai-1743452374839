# Attention Checker Frontend

## Features
- Upload images to analyze visual attention areas
- Toggle between original and saliency map views
- Responsive design for all device sizes
- Error handling and loading states

## Development
1. Install dependencies:
```bash
npm install
```

2. Run locally:
```bash
npm start
```

## Deployment
### Netlify
1. Connect to your GitHub repository
2. Set build command:
```bash
npm run build
```
3. Set publish directory to `build`
4. Add environment variables if needed

### Environment Variables
For production, set:
```
REACT_APP_API_URL=your-backend-url