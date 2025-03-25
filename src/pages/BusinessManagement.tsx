import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, FileSpreadsheet, FileCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Business, Product, TeamMember, ValuePropositionCanvas, BusinessModelCanvas } from '../types';
import { toast } from 'sonner';

export function BusinessManagement() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'products' | 'team' | 'canvas'>('details');
  const [canvasType, setCanvasType] = useState<'vp' | 'bmc'>('vp');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    youtube_video_url: '',
    website_url: '',
    email: '',
    phone: ''
  });

  const [bmcForm, setBmcForm] = useState<BusinessModelCanvas>({
    id: '',
    business_id: '',
    key_partners: [],
    key_activities: [],
    key_resources: [],
    value_propositions: [],
    customer_relationships: [],
    channels: [],
    customer_segments: [],
    cost_structure: [],
    revenue_streams: [],
    created_at: '',
    updated_at: ''
  });

  const [vpcForm, setVpcForm] = useState<ValuePropositionCanvas>({
    id: '',
    business_id: '',
    customer_jobs: [],
    pains: [],
    gains: [],
    products_services: [],
    pain_relievers: [],
    gain_creators: [],
    created_at: '',
    updated_at: ''
  });

  useEffect(() => {
    loadBusinessData();
  }, []);

  async function loadBusinessData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Load business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (businessError) throw businessError;
      
      // If business exists, set the data
      if (businessData) {
        setBusiness(businessData);
        setFormData({
          name: businessData.name,
          description: businessData.description,
          industry: businessData.industry,
          youtube_video_url: businessData.youtube_video_url || '',
          website_url: businessData.website_url || '',
          email: businessData.email || '',
          phone: businessData.phone || ''
        });

        // Load business model canvas
        const { data: bmcData } = await supabase
          .from('business_model_canvas')
          .select('*')
          .eq('business_id', businessData.id)
          .maybeSingle();

        if (bmcData) {
          setBmcForm(bmcData);
        }

        // Load value proposition canvas
        const { data: vpcData } = await supabase
          .from('value_proposition_canvas')
          .select('*')
          .eq('business_id', businessData.id)
          .maybeSingle();

        if (vpcData) {
          setVpcForm(vpcData);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBusiness(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: newBusiness, error: createError } = await supabase
        .from('businesses')
        .insert([{
          ...formData,
          owner_id: user.id
        }])
        .select()
        .single();

      if (createError) throw createError;

      setBusiness(newBusiness);
      toast.success('Business created successfully');
      loadBusinessData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update(formData)
        .eq('id', business.id);

      if (error) throw error;
      
      toast.success('Business details saved successfully');
      loadBusinessData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCanvas(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;

    setSaving(true);
    try {
      if (canvasType === 'bmc') {
        // Remove id if it's empty to allow new record creation
        const { id, ...bmcData } = bmcForm;
        const { error } = await supabase
          .from('business_model_canvas')
          .upsert({
            ...bmcData,
            business_id: business.id,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      } else {
        // Remove id if it's empty to allow new record creation
        const { id, ...vpcData } = vpcForm;
        const { error } = await supabase
          .from('value_proposition_canvas')
          .upsert({
            ...vpcData,
            business_id: business.id,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }
      
      toast.success('Canvas saved successfully');
      loadBusinessData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!business) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Business</h2>
          <form onSubmit={handleCreateBusiness} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select an industry</option>
                <option value="Technology">Technology</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Retail">Retail</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                <Plus className="h-5 w-5 mr-2" />
                {saving ? 'Creating...' : 'Create Business'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
        <p className="mt-2 text-gray-600">{business.description}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Business Details
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`${
              activeTab === 'canvas'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Business Canvas
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'details' && (
          <form onSubmit={handleSaveDetails} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select an industry</option>
                <option value="Technology">Technology</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Retail">Retail</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">YouTube Video URL</label>
              <input
                type="url"
                value={formData.youtube_video_url}
                onChange={(e) => setFormData({ ...formData, youtube_video_url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Website URL</label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'canvas' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setCanvasType('bmc')}
                  className={`px-4 py-2 rounded-md ${
                    canvasType === 'bmc'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FileSpreadsheet className="h-5 w-5 inline-block mr-2" />
                  Business Model Canvas
                </button>
                <button
                  onClick={() => setCanvasType('vp')}
                  className={`px-4 py-2 rounded-md ${
                    canvasType === 'vp'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FileCheck className="h-5 w-5 inline-block mr-2" />
                  Value Proposition Canvas
                </button>
              </div>
            </div>

            {canvasType === 'bmc' && (
              <form onSubmit={handleSaveCanvas} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Key Partners</label>
                    <p className="text-sm text-gray-500 mb-2">Who are your key partners and suppliers?</p>
                    <textarea
                      value={bmcForm.key_partners.join('\n')}
                      onChange={(e) => setBmcForm({
                        ...bmcForm,
                        key_partners: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one partner per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Key Activities</label>
                    <p className="text-sm text-gray-500 mb-2">What key activities does your value proposition require?</p>
                    <textarea
                      value={bmcForm.key_activities.join('\n')}
                      onChange={(e) => setBmcForm({
                        ...bmcForm,
                        key_activities: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one activity per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Key Resources</label>
                    <p className="text-sm text-gray-500 mb-2">What key resources does your value proposition require?</p>
                    <textarea
                      value={bmcForm.key_resources.join('\n')}
                      onChange={(e) => setBmcForm({
                        ...bmcForm,
                        key_resources: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one resource per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Value Propositions</label>
                    <p className="text-sm text-gray-500 mb-2">What value do you deliver to the customer?</p>
                    <textarea
                      value={bmcForm.value_propositions.join('\n')}
                      onChange={(e) => setBmcForm({
                        ...bmcForm,
                        value_propositions: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one value proposition per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Relationships</label>
                    <p className="text-sm text-gray-500 mb-2">What type of relationship does each customer segment expect?</p>
                    <textarea
                      value={bmcForm.customer_relationships.join('\n')}
                      onChange={(e) => setBmcForm({
                        ...bmcForm,
                        customer_relationships: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one relationship type per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Channels</label>
                    <p className="text-sm text-gray-500 mb-2">Through which channels do your customers want to be reached?</p>
                    <textarea
                      value={bmcForm.channels.join('\n')}
                      onChange={(e) => setBmcForm({
                        ...bmcForm,
                        channels: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one channel per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Segments</label>
                    <p className="text-sm text-gray-500 mb-2">Which customer segments are you creating value for?</p>
                    <textarea
                      value={bmcForm.customer_segments.join('\n')}
                      onChange={(e) => setBmcForm({
                        ...bmcForm,
                        customer_segments: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one segment per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cost Structure</label>
                    <p className="text-sm text-gray-500 mb-2">What are the most important costs in your business model?</p>
                    <textarea
                      value={bmcForm.cost_structure.join('\n')}
                      onChange={(e) => setBmcForm({
                        ...bmcForm,
                        cost_structure: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one cost item per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Revenue Streams</label>
                    <p className="text-sm text-gray-500 mb-2">For what value are your customers willing to pay?</p>
                    <textarea
                      value={bmcForm.revenue_streams.join('\n')}
                      onChange={(e) => setBmcForm({
                        ...bmcForm,
                        revenue_streams: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one revenue stream per line"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {saving ? 'Saving...' : 'Save Canvas'}
                  </button>
                </div>
              </form>
            )}

            {canvasType === 'vp' && (
              <form onSubmit={handleSaveCanvas} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Jobs</label>
                    <p className="text-sm text-gray-500 mb-2">What jobs do your customers need to get done?</p>
                    <textarea
                      value={vpcForm.customer_jobs.join('\n')}
                      onChange={(e) => setVpcForm({
                        ...vpcForm,
                        customer_jobs: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one job per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pains</label>
                    <p className="text-sm text-gray-500 mb-2">What pains do your customers experience?</p>
                    <textarea
                      value={vpcForm.pains.join('\n')}
                      onChange={(e) => setVpcForm({
                        ...vpcForm,
                        pains: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one pain per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gains</label>
                    <p className="text-sm text-gray-500 mb-2">What gains do your customers want to achieve?</p>
                    <textarea
                      value={vpcForm.gains.join('\n')}
                      onChange={(e) => setVpcForm({
                        ...vpcForm,
                        gains: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one gain per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Products & Services</label>
                    <p className="text-sm text-gray-500 mb-2">What products and services do you offer?</p>
                    <textarea
                      value={vpcForm.products_services.join('\n')}
                      onChange={(e) => setVpcForm({
                        ...vpcForm,
                        products_services: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one product/service per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pain Relievers</label>
                    <p className="text-sm text-gray-500 mb-2">How do your products/services relieve customer pains?</p>
                    <textarea
                      value={vpcForm.pain_relievers.join('\n')}
                      onChange={(e) => setVpcForm({
                        ...vpcForm,
                        pain_relievers: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one pain reliever per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gain Creators</label>
                    <p className="text-sm text-gray-500 mb-2">How do your products/services create customer gains?</p>
                    <textarea
                      value={vpcForm.gain_creators.join('\n')}
                      onChange={(e) => setVpcForm({
                        ...vpcForm,
                        gain_creators: e.target.value.split('\n').filter(Boolean)
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter one gain creator per line"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {saving ? 'Saving...' : 'Save Canvas'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}