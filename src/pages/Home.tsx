import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Mail, Phone, Globe, MapPin, TrendingUp, Youtube } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Business } from '../types';

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    let videoId = '';

    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname === 'youtube.com' || urlObj.hostname === 'www.youtube.com') {
      if (urlObj.searchParams.has('v')) {
        videoId = urlObj.searchParams.get('v') || '';
      } else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/')[2];
      } else if (urlObj.pathname.startsWith('/v/')) {
        videoId = urlObj.pathname.split('/')[2];
      }
    }

    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1`;
  } catch (error) {
    console.error('Invalid YouTube URL:', error);
    return null;
  }
}

export function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error: any) {
      console.error('Error loading businesses:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const industries = [...new Set(businesses.map(b => b.industry))];

  const filteredBusinesses = businesses.filter(business =>
    (business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.industry.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedIndustry || business.industry === selectedIndustry)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Student Business Showcase
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Discover innovative businesses created by our talented student entrepreneurs. Connect with the next generation of business leaders.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -mt-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search businesses by name, description, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Business Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-lg p-6">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredBusinesses.map((business) => (
              <div key={business.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
                      <div className="mt-1 flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{business.industry}</span>
                      </div>
                    </div>
                    {business.rating > 0 && (
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-yellow-700">
                          {business.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-gray-600">{business.description}</p>

                  {business.youtube_video_url && (
                    <div className="mt-6 aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <iframe
                        src={getYouTubeEmbedUrl(business.youtube_video_url)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {business.email && (
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <a
                          href={`mailto:${business.email}`}
                          className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          {business.email}
                        </a>
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-2" />
                        <a
                          href={`tel:${business.phone}`}
                          className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          {business.phone}
                        </a>
                      </div>
                    )}
                    {business.website_url && (
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-2" />
                        <a
                          href={business.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    {business.youtube_video_url && (
                      <div className="flex items-center">
                        <Youtube className="h-5 w-5 text-gray-400 mr-2" />
                        <a
                          href={business.youtube_video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Watch on YouTube
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No businesses found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}