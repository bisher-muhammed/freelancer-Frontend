'use client';
import React, { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, DollarSign, Star, ChevronDown, Award, Filter } from "lucide-react";
import { apiPrivate } from "@/lib/apiPrivate";

export default function BrowseFreelancers() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [hourlyRange, setHourlyRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('Recommended');

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await apiPrivate.get('/freelancers');
        console.log(response.data);
        setFreelancers(response.data.results || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  // Filter freelancers based on search and filters
  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = 
      freelancer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.skills_names?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      freelancer.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hourlyRate = parseFloat(freelancer.hourly_rate || 0);
    const matchesRate = hourlyRate >= hourlyRange[0] && hourlyRate <= hourlyRange[1];
    
    const matchesCategory = selectedCategory === 'All Categories' || 
      freelancer.categories_names?.includes(selectedCategory);
    
    return matchesSearch && matchesRate && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const allCategories = ['All Categories', ...new Set(
    freelancers.flatMap(f => f.categories_names || [])
  )];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Loading freelancers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Data</h3>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
            Browse Freelancers
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Find the perfect talent for your project
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by skills, name, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400 font-medium transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none px-6 py-4 pr-12 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer text-slate-900 font-medium min-w-[200px] transition-all"
              >
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
            <button className="px-6 py-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium text-slate-700 flex items-center gap-2 justify-center">
              <Filter className="w-5 h-5" />
              More Filters
            </button>
          </div>

          {/* Hourly Rate Range Slider */}
          <div className="bg-slate-50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-semibold text-slate-900">Hourly Rate Range</label>
              <span className="text-base font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-lg">
                ${hourlyRange[0]} - ${hourlyRange[1]}/hr
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={hourlyRange[1]}
              onChange={(e) => setHourlyRange([hourlyRange[0], parseInt(e.target.value)])}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <p className="text-lg text-slate-700 font-medium">
            <span className="font-bold text-slate-900 text-xl">{filteredFreelancers.length}</span> freelancers found
          </p>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-5 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer text-slate-900 font-medium transition-all"
            >
              <option>Recommended</option>
              <option>Highest Rated</option>
              <option>Most Reviews</option>
              <option>Lowest Rate</option>
              <option>Highest Rate</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* Freelancers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFreelancers.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-600">No freelancers found matching your criteria</p>
              <p className="text-sm text-slate-500 mt-2">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            filteredFreelancers.map((freelancer) => (
              <div
                key={freelancer.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6 md:p-7 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Freelancer Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative flex-shrink-0">
                    {freelancer.profile_picture ? (
                      <img
                        src={freelancer.profile_picture}
                        alt={freelancer.username}
                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-slate-100 shadow-lg">
                        {freelancer.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    {freelancer.is_verified && (
                      <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-1.5 ring-4 ring-white shadow-lg">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-1.5 truncate">
                      {freelancer.username}
                    </h3>
                    <p className="text-slate-600 mb-2.5 font-medium text-base line-clamp-1">
                      {freelancer.title}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900 text-base">4.9</span>
                      <span className="text-slate-500 text-sm font-medium">(127 reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-slate-600 text-base mb-5 line-clamp-2 leading-relaxed font-medium">
                  {freelancer.bio}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {freelancer.skills_names?.slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                  {freelancer.skills_names?.length > 4 && (
                    <span className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200">
                      +{freelancer.skills_names.length - 4} more
                    </span>
                  )}
                </div>

                {/* Education & Experience Info */}
                {(freelancer.education?.length > 0 || freelancer.experience?.length > 0) && (
                  <div className="text-sm text-slate-600 mb-5 space-y-2 bg-slate-50 rounded-xl p-4">
                    {freelancer.education?.[0] && (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="font-medium truncate">
                          {freelancer.education[0].degree} - {freelancer.education[0].institution}
                        </span>
                      </div>
                    )}
                    {freelancer.experience?.[0] && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="font-medium truncate">
                          {freelancer.experience[0].role} at {freelancer.experience[0].company}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-5 border-t-2 border-slate-100 mb-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-lg">${freelancer.hourly_rate}</span>
                    <span className="text-slate-500 font-medium">/hr</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Briefcase className="w-5 h-5 text-slate-500" />
                    <span className="text-base font-semibold">156 jobs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">{freelancer.contact_number ? 'Available' : 'Remote'}</span>
                  </div>
                  <span className="px-4 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-lg border border-green-200">
                    Available Now
                  </span>
                </div>

                {/* View Profile Button */}
                <button className="w-full py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98]">
                  View Profile
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}