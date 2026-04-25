import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertCircle, Search } from 'lucide-react';
import { getGroqResponse } from '../lib/groq';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Default center (New Delhi)
const defaultCenter = [28.6139, 77.2090];

// Helper to update map view when center changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Helper to handle map clicks
function LocationMarker({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const Map = () => {
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(5);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [localInfo, setLocalInfo] = useState(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  
  const fetchLocalPoliticalInfo = async (lat, lng) => {
    setIsLoadingInfo(true);
    setLocalInfo(null);
    try {
      const prompt = `Based on the approximate geographical coordinates (Latitude: ${lat}, Longitude: ${lng}) in India, what are the typically dominating political parties or the general political landscape of this region? 
      Please provide:
      1. The likely state/region.
      2. The names of the dominating political parties.
      3. Estimated historical support percentages or general strength (e.g., "Strong majority", "~40% vote share").
      Keep the answer brief (2-3 paragraphs max), informative, and neutral.`;
      
      const response = await getGroqResponse(prompt);
      setLocalInfo(response);
    } catch (error) {
      console.error("Error fetching local info:", error);
      setLocalInfo("Sorry, I couldn't fetch the political landscape information for this location at the moment.");
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const getUserLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos = [position.coords.latitude, position.coords.longitude];
        setCenter(newPos);
        setUserLocation(newPos);
        setZoom(12);
        fetchLocalPoliticalInfo(newPos[0], newPos[1]);
      },
      (error) => {
        setLocationError("Unable to retrieve your location. Please check your browser permissions.");
        console.error("Geolocation error:", error);
      }
    );
  };
  
  const handleMapClick = (latlng) => {
    setCenter(latlng);
    setUserLocation(latlng);
    setZoom(12);
    fetchLocalPoliticalInfo(latlng[0], latlng[1]);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 lg:h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <MapPin className="text-primary-600" size={32} />
            Local Political Landscape
          </h1>
          <p className="text-slate-500 mt-1">Explore dominating parties and election info in your area.</p>
        </div>
        
        <button 
          onClick={getUserLocation}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
        >
          <Navigation size={18} />
          Find My Location
        </button>
      </div>

      {locationError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
          <p>{locationError}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Map Container */}
        <div className="lg:w-2/3 h-96 lg:h-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative z-0">
          <MapContainer 
            center={center} 
            zoom={zoom} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={center} zoom={zoom} />
            <LocationMarker onMapClick={handleMapClick} />
            {userLocation && (
              <Marker position={userLocation} />
            )}
          </MapContainer>
          
          <div className="absolute top-4 left-12 right-4 md:right-auto md:w-80 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 flex gap-2 z-[1000]">
            <Search size={20} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Tap anywhere on the map..." 
              disabled
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:w-1/3 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Regional Insights</h2>
            <p className="text-sm text-slate-500 mt-1">Powered by AI</p>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            {!userLocation ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4 py-12">
                <MapPin size={48} className="opacity-20" />
                <p>Click "Find My Location" or tap anywhere on the map to see political insights for that area.</p>
              </div>
            ) : isLoadingInfo ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Analyzing regional data...</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-sm prose-slate prose-p:leading-relaxed"
              >
                <div className="mb-4 inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200">
                  Location Analyzed
                </div>
                <ReactMarkdown>{DOMPurify.sanitize(localInfo)}</ReactMarkdown>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
