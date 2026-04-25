import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, AlertCircle, Search, Info } from 'lucide-react';
import { getGroqResponse } from '../lib/groq';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import 'leaflet/dist/leaflet.css';
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

// Component to handle map clicks and view updates
function MapEvents({ onClick, center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);

  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

const Map = () => {
  const [center, setCenter] = useState(defaultCenter);
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
      3. Estimated historical support or general strength.
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
        fetchLocalPoliticalInfo(newPos[0], newPos[1]);
      },
      (error) => {
        setLocationError("Unable to retrieve your location. Please check your browser permissions.");
      }
    );
  };

  const handleMapClick = (latlng) => {
    const newPos = [latlng.lat, latlng.lng];
    setUserLocation(newPos);
    setCenter(newPos);
    fetchLocalPoliticalInfo(newPos[0], newPos[1]);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 lg:h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <MapPin className="text-blue-600" size={32} />
            Local Political Landscape
          </h1>
          <p className="text-slate-500 mt-1">Explore dominating parties and election info in your area.</p>
        </div>
        
        <button 
          onClick={getUserLocation}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
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
        <div className="lg:w-2/3 h-[400px] lg:h-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative z-0">
          <MapContainer 
            center={defaultCenter} 
            zoom={5} 
            className="w-full h-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents onClick={handleMapClick} center={center} />
            {userLocation && <Marker position={userLocation} />}
          </MapContainer>
          
          <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200 flex gap-2 z-[1000]">
            <Search size={20} className="text-slate-400" />
            <span className="text-sm text-slate-500">Tap anywhere on the map...</span>
          </div>

          <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 p-2 rounded-lg text-[10px] text-slate-500 border border-slate-200">
            Click to analyze regional politics
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:w-1/3 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Regional Insights</h2>
              <p className="text-sm text-slate-500">AI-Powered Analysis</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Info size={20} />
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {!userLocation ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4 py-12"
                >
                  <MapPin size={48} className="opacity-20 text-blue-600" />
                  <p className="max-w-[200px]">Tap on the map to see political insights for that area.</p>
                </motion.div>
              ) : isLoadingInfo ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center space-y-4 py-12"
                >
                  <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium">Analyzing regional data...</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-sm prose-slate prose-p:leading-relaxed"
                >
                  <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-blue-600 mb-1">Coordinates Analyzed</p>
                    <p className="text-sm font-mono text-blue-800">{userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}</p>
                  </div>
                  <ReactMarkdown>{DOMPurify.sanitize(localInfo)}</ReactMarkdown>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
