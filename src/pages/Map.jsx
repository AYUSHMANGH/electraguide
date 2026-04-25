import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertCircle, Search } from 'lucide-react';
import { getGeminiResponse } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

// Default center (New Delhi)
const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [localInfo, setLocalInfo] = useState(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const fetchLocalPoliticalInfo = async (lat, lng) => {
    setIsLoadingInfo(true);
    setLocalInfo(null);
    try {
      // Create a prompt for Gemini to guess the dominating political parties based on coordinates
      // In a real app, this would use a reverse geocoding API first, then query a political database
      const prompt = `Based on the approximate geographical coordinates (Latitude: ${lat}, Longitude: ${lng}) in India, what are the typically dominating political parties or the general political landscape of this region? 
      Please provide:
      1. The likely state/region.
      2. The names of the dominating political parties.
      3. Estimated historical support percentages or general strength (e.g., "Strong majority", "~40% vote share").
      Keep the answer brief (2-3 paragraphs max), informative, and neutral.`;
      
      const response = await getGeminiResponse(prompt);
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
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(newPos);
        setUserLocation(newPos);
        map?.panTo(newPos);
        map?.setZoom(12);
        
        // Fetch info for the user's location
        fetchLocalPoliticalInfo(newPos.lat, newPos.lng);
      },
      (error) => {
        setLocationError("Unable to retrieve your location. Please check your browser permissions.");
        console.error("Geolocation error:", error);
      }
    );
  };
  
  // Handle manual map click to check other areas
  const handleMapClick = (e) => {
      const newPos = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
      };
      setCenter(newPos);
      setUserLocation(newPos);
      fetchLocalPoliticalInfo(newPos.lat, newPos.lng);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-[calc(100vh-8rem)] flex flex-col">
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
        <div className="lg:w-2/3 h-[400px] lg:h-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
          {!isLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={5}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onClick={handleMapClick}
              options={{
                styles: [
                  {
                    featureType: "administrative",
                    elementType: "geometry",
                    stylers: [{ visibility: "on" }]
                  },
                  {
                    featureType: "poi",
                    stylers: [{ visibility: "off" }]
                  }
                ],
                streetViewControl: false,
                mapTypeControl: false,
              }}
            >
              {userLocation && (
                <Marker position={userLocation} animation={window.google.maps.Animation.DROP} />
              )}
            </GoogleMap>
          )}
          
          <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 flex gap-2">
            <Search size={20} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Click anywhere on the map..." 
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
                <ReactMarkdown>{localInfo}</ReactMarkdown>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
