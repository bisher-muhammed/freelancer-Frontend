'use client';
import React, { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, DollarSign, Star, ChevronDown, Award } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading freelancers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Freelancers</h1>
          <p className="text-gray-600">Find the perfect talent for your project</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by skills, name, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none px-6 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
              >
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
            <button className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              More Filters
            </button>
          </div>

          {/* Hourly Rate Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Hourly Rate Range</label>
              <span className="text-sm text-gray-600">
                ${hourlyRange[0]} - ${hourlyRange[1]}/hr
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={hourlyRange[1]}
              onChange={(e) => setHourlyRange([hourlyRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredFreelancers.length}</span> freelancers found
          </p>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              <option>Recommended</option>
              <option>Highest Rated</option>
              <option>Most Reviews</option>
              <option>Lowest Rate</option>
              <option>Highest Rate</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Freelancers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFreelancers.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No freelancers found matching your criteria</p>
            </div>
          ) : (
            filteredFreelancers.map((freelancer) => (
              <div
                key={freelancer.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Freelancer Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    {freelancer.profile_picture ? (
                      <img
                        src={freelancer.profile_picture}
                        alt={freelancer.username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                        {freelancer.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    {freelancer.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {freelancer.username}
                    </h3>
                    <p className="text-gray-600 mb-2">{freelancer.title}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">4.9</span>
                      <span className="text-gray-500 text-sm">(127 reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {freelancer.bio}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {freelancer.skills_names?.slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {freelancer.skills_names?.length > 4 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      +{freelancer.skills_names.length - 4}
                    </span>
                  )}
                </div>

                {/* Education & Experience Info */}
                {(freelancer.education?.length > 0 || freelancer.experience?.length > 0) && (
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    {freelancer.education?.[0] && (
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>
                          {freelancer.education[0].degree} - {freelancer.education[0].institution}
                        </span>
                      </div>
                    )}
                    {freelancer.experience?.[0] && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        <span>
                          {freelancer.experience[0].role} at {freelancer.experience[0].company}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">${freelancer.hourly_rate}/hr</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm">156 jobs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{freelancer.contact_number ? 'Available' : 'Remote'}</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Available Now
                  </span>
                </div>

                {/* View Profile Button */}
                <button className="w-full mt-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
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
