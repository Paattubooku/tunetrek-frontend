# Album Details Modules Integration - Complete Flow

## Overview
The AlbumDetails page fetches and displays related content modules (like "You Might Like", "Currently Trending Albums", etc.) from the JioSaavn API.

## Architecture

### 1. Backend API Structure

#### Route (musicRoutes.js)
```javascript
router.get("/otherDetails/:title/:source/:data", musicController.getOtherDetails);
```

#### Controller (musicController.js)
```javascript
exports.getOtherDetails = async (req, res) => {
    try {
        const { title, source, data } = req.params;
        const { language = "tamil,english" } = req.query;
        
        // Construct JioSaavn API URL
        const url = `${JIOSAAVN_API_BASE_URL}?__call=${source}&api_version=${API_VERSION}&_format=json&_marker=0&ctx=${CTX}&${data}`;
        
        const responseData = await makeApiRequest(url, language);
        
        // Wrap response in object with title as key
        const otherDetails = { [title]: responseData };
        res.json(otherDetails);
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
};
```

**Response Structure:**
```json
{
  "You Might Like": [
    { "id": "...", "title": "...", "image": "...", ... }
  ]
}
```

### 2. Frontend Integration (AlbumDetails.jsx)

#### Step 1: Fetch Album Details
```javascript
const response = await fetch(`http://localhost:8080/details/${id}/album`);
const data = await response.json();
```

**Album Response Contains:**
```json
{
  "id": "19479273",
  "title": "Master",
  "list": [...],  // Track list
  "modules": {
    "reco": {
      "title": "You Might Like",
      "source": "reco.getAlbumReco",
      "source_params": { "albumid": "19479273" }
    },
    "currentlyTrending": {
      "title": "Currently Trending Albums",
      "source": "content.getTrending",
      "source_params": { "entity_type": "album", "entity_language": "tamil" }
    }
  }
}
```

#### Step 2: Extract and Fetch Module Data
```javascript
if (data.modules) {
    const moduleKeys = Object.keys(data.modules).filter(key => key !== 'list');
    
    const modulesWithData = await Promise.all(
        moduleKeys.map(async (key) => {
            const module = data.modules[key];
            
            // Convert source_params to URL query string
            const params = new URLSearchParams(module.source_params).toString();
            // Example: "albumid=19479273"
            
            // Fetch module data
            const moduleResponse = await fetch(
                `http://localhost:8080/otherDetails/${encodeURIComponent(module.title)}/${module.source}/${params}`
            );
            // Example: /otherDetails/You%20Might%20Like/reco.getAlbumReco/albumid=19479273
            
            const moduleData = await moduleResponse.json();
            
            // Extract actual data (response is wrapped with title as key)
            const actualData = moduleData[module.title] || moduleData;
            
            return {
                key,
                title: module.title,
                source: module.source,
                data: actualData  // Array of albums/songs
            };
        })
    );
    
    setModulesData(modulesWithData);
}
```

#### Step 3: Display Module Data
```javascript
{modulesData.map((module) => (
    <div key={module.key}>
        <h2>{module.title}</h2>
        
        {module.data && Array.isArray(module.data) && module.data.length > 0 ? (
            <div className="horizontal-scroll">
                {module.data.map((item) => (
                    <Link to={`/album/${extractIdFromUrl(item.perma_url) || item.id}`}>
                        <img src={getHighQualityImage(item.image)} />
                        <h4>{item.title}</h4>
                        <p>{item.subtitle}</p>
                    </Link>
                ))}
            </div>
        ) : (
            <p>No content available</p>
        )}
    </div>
))}
```

## Complete Request Flow

### Example: "You Might Like" Module

1. **Album Details Request:**
   ```
   GET /details/jca5X1ng3iM_/album
   ```

2. **Album Response (modules section):**
   ```json
   {
     "modules": {
       "reco": {
         "title": "You Might Like",
         "source": "reco.getAlbumReco",
         "source_params": { "albumid": "19479273" }
       }
     }
   }
   ```

3. **Module Data Request:**
   ```
   GET /otherDetails/You%20Might%20Like/reco.getAlbumReco/albumid=19479273
   ```

4. **Backend Constructs JioSaavn URL:**
   ```
   https://www.jiosaavn.com/api.php?__call=reco.getAlbumReco&api_version=4&_format=json&_marker=0&ctx=web6dot0&albumid=19479273
   ```

5. **Backend Response:**
   ```json
   {
     "You Might Like": [
       {
         "id": "123",
         "title": "Similar Album 1",
         "image": "...",
         "perma_url": "..."
       }
     ]
   }
   ```

6. **Frontend Extracts Data:**
   ```javascript
   const actualData = moduleData["You Might Like"];
   // actualData = [{ id: "123", title: "Similar Album 1", ... }]
   ```

7. **Frontend Displays:**
   - Horizontal scrollable cards
   - Each card links to album details
   - High-quality images
   - Hover effects and animations

## Error Handling

### Frontend
- Each module fetch wrapped in try-catch
- Failed modules marked with `error: true`
- Display shows error state with red styling

### Backend
- Returns 500 status on error
- Logs error to console
- Returns generic error message

## Key Features

1. **Parallel Loading**: All modules fetch simultaneously using `Promise.all`
2. **URL Encoding**: Module titles are URL-encoded for safe transmission
3. **Response Unwrapping**: Frontend extracts data from wrapped response
4. **Fallback Handling**: Shows appropriate UI for missing/failed data
5. **Type Safety**: Checks if data is array before mapping

## Module Types

Common modules returned by JioSaavn:
- `reco` - "You Might Like" (album recommendations)
- `currentlyTrending` - "Currently Trending Albums"
- `topAlbumsFromSameYear` - "Top Albums from Same Year"
- `artists` - "Artists" (artist cards)

Each module can have different:
- **source**: API endpoint to call (e.g., "reco.getAlbumReco")
- **source_params**: Parameters for the API call (e.g., {"albumid": "123"})
- **title**: Display name for the section

## Testing

To test the integration:
1. Navigate to any album details page
2. Check browser console for "Modules Data:" log
3. Verify module sections appear below the track list
4. Click on recommended albums to navigate
5. Check for error states if API fails

All modules are now fully integrated and displaying real data from the JioSaavn API! 🎵✨
