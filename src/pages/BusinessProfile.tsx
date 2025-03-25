import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Business } from '../types';
import { supabase } from '../lib/supabase';

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    let videoId = '';

    // Handle youtu.be URLs
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } 
    // Handle youtube.com URLs
    else if (urlObj.hostname === 'youtube.com' || urlObj.hostname === 'www.youtube.com') {
      // Handle watch URLs
      if (urlObj.searchParams.has('v')) {
        videoId = urlObj.searchParams.get('v') || '';
      }
      // Handle embed URLs
      else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/')[2];
      }
      // Handle shortened URLs
      else if (urlObj.pathname.startsWith('/v/')) {
        videoId = urlObj.pathname.split('/')[2];
      }
    }

    if (!videoId) return null;

    // Construct embed URL with necessary parameters
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1`;
  } catch (error) {
    console.error('Invalid YouTube URL:', error);
    return null;
  }
}

export function BusinessProfile() {
  const { id } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusiness() {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setBusiness(data);
      } catch (error) {
        console.error('Error loading business:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-8"></div>
          <div className="aspect-video bg-gray-200 rounded mb-8"></div>
          <div className="bg-gray-200 rounded p-6">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Business Not Found</h2>
          <p className="mt-2 text-gray-600">The business you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const embedUrl = business.youtube_video_url ? getYouTubeEmbedUrl(business.youtube_video_url) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{business.name}</h1>
      <p className="text-gray-600 mb-8">{business.description}</p>

      {embedUrl && (
        <div className="aspect-video mb-8 rounded-lg overflow-hidden shadow-lg bg-gray-100">
          <iframe
            title={`${business.name} video`}
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Details</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Industry</dt>
            <dd className="mt-1 text-gray-900">{business.industry}</dd>
          </div>

          {business.website_url && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Website</dt>
              <dd className="mt-1">
                <a
                  href={business.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Visit Website
                </a>
              </dd>
            </div>
          )}

          {business.email && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${business.email}`}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {business.email}
                </a>
              </dd>
            </div>
          )}

          {business.phone && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1">
                <a
                  href={`tel:${business.phone}`}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {business.phone}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}