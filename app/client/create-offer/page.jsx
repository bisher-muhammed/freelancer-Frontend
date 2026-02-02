"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import { User, Briefcase, CheckCircle, DollarSign, Calendar, Clock, FileText, AlertCircle, TrendingUp } from "lucide-react";

export default function CreateOfferPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const proposalId = searchParams.get("proposal");
  
  const [proposalInfo, setProposalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState({
    total_budget: "",
    agreed_hourly_rate: "",
    estimated_hours: "",
    message: "",
    valid_until: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (proposalId) {
      fetchProposalInfo();
    }
  }, [proposalId]);

  const fetchProposalInfo = async () => {
    try {
      const res = await apiPrivate.get(`/proposals/${proposalId}/`);
      setProposalInfo(res.data);
    } catch (err) {
      console.error("Failed to fetch proposal info:", err);
      setError("Failed to load proposal information");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOffer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proposalId) {
      setError("No proposal selected");
      return;
    }

    // Validation
    const totalBudget = parseFloat(offer.total_budget);
    const hourlyRate = parseFloat(offer.agreed_hourly_rate);
    const estimatedHours = offer.estimated_hours ? parseFloat(offer.estimated_hours) : null;

    if (totalBudget <= 0) {
      setError("Total budget must be greater than zero");
      return;
    }

    if (hourlyRate <= 0) {
      setError("Hourly rate must be greater than zero");
      return;
    }

    if (estimatedHours && estimatedHours > 0) {
      const expectedCost = hourlyRate * estimatedHours;
      if (expectedCost > totalBudget) {
        setError(`Estimated cost ($${expectedCost.toFixed(2)}) exceeds total budget ($${totalBudget.toFixed(2)})`);
        return;
      }
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        proposal: proposalId,
        total_budget: totalBudget,
        agreed_hourly_rate: hourlyRate,
        estimated_hours: estimatedHours || null,
        message: offer.message || "",
        valid_until: offer.valid_until,
      };

      await apiPrivate.post("/offers/create/", payload);
      setSuccess("Offer created successfully!");
      
      // Redirect to proposals page after 2 seconds
      setTimeout(() => {
        router.push("http://localhost:3000/client/proposals");
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          (err.response?.data ? JSON.stringify(err.response.data) : null) ||
                          "Failed to create offer. Please check your input and try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate budget usage percentage
  const calculateBudgetUsage = () => {
    const totalBudget = parseFloat(offer.total_budget);
    const hourlyRate = parseFloat(offer.agreed_hourly_rate);
    const estimatedHours = parseFloat(offer.estimated_hours);

    if (totalBudget > 0 && hourlyRate > 0 && estimatedHours > 0) {
      const estimatedCost = hourlyRate * estimatedHours;
      const percentage = (estimatedCost / totalBudget) * 100;
      return {
        cost: estimatedCost,
        percentage: percentage,
        remaining: totalBudget - estimatedCost,
      };
    }
    return null;
  };

  const budgetUsage = calculateBudgetUsage();

  if (!proposalId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Proposal Selected</h2>
            <p className="text-gray-600 mb-6">Please select a valid proposal to create an offer.</p>
            <button
              onClick={() => router.push("/client/proposals")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Go to Proposals
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading proposal details...</p>
          <p className="mt-2 text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Success Message Modal */}
        {success && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Success!</h3>
                <p className="text-gray-600 mb-6">{success}</p>
                <p className="text-gray-500 text-sm mb-6">Redirecting to proposals page...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full animate-progress"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proposal Info Card */}
        {proposalInfo && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Create Offer</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Make an offer to the freelancer who submitted this proposal
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Proposal Details */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Proposal Details
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Freelancer Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Freelancer</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{proposalInfo.freelancer?.username}</h4>
                          <p className="text-gray-600 text-sm truncate">{proposalInfo.freelancer?.email}</p>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium mt-2">
                            <CheckCircle className="w-3 h-3" />
                            Proposal Accepted
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Project</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Project Title</p>
                          <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {proposalInfo.project?.title}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Type</p>
                            <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg capitalize">
                              {proposalInfo.project?.assignment_type}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                              Active
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        How Escrow Works
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>Total budget is held in escrow upfront</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>Freelancer is paid at the agreed hourly rate</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>Estimated hours are for planning only</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>Work continues until budget is exhausted</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Offer Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                  {/* Success/Error Messages */}
                  {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-red-800 mb-1">Error creating offer</h3>
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Budget and Rate Section */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          Payment Structure
                        </h3>
                        <p className="text-sm text-gray-700">
                          Set the total escrow budget and hourly rate. The freelancer will be paid at the hourly rate until the budget is exhausted.
                        </p>
                      </div>

                      {/* Total Budget */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Total Escrow Budget *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600" />
                          </div>
                          <input
                            type="number"
                            name="total_budget"
                            value={offer.total_budget}
                            onChange={handleChange}
                            className="pl-11 w-full px-4 py-3.5 text-lg font-medium text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder:text-gray-400"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="Enter total budget amount"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-600">USD</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          This amount will be held in escrow and paid out based on hours worked
                        </p>
                      </div>

                      {/* Agreed Hourly Rate */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Agreed Hourly Rate *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600" />
                          </div>
                          <input
                            type="number"
                            name="agreed_hourly_rate"
                            value={offer.agreed_hourly_rate}
                            onChange={handleChange}
                            className="pl-11 w-full px-4 py-3.5 text-lg font-medium text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder:text-gray-400"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="Hourly rate"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-600">USD/hour</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Rate at which the freelancer will be paid per hour worked
                        </p>
                      </div>

                      {/* Estimated Hours (Optional) */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Estimated Hours (Optional)
                        </label>
                        <div className="relative group">
                          <input
                            type="number"
                            name="estimated_hours"
                            value={offer.estimated_hours}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 text-lg font-medium text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder:text-gray-400"
                            step="1"
                            min="1"
                            placeholder="Estimated hours"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-600">hours</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          For planning purposes only - actual hours may vary
                        </p>
                      </div>

                      {/* Budget Calculation Display */}
                      {budgetUsage && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                          <h4 className="font-semibold text-gray-900">Budget Calculation</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Estimated Cost:</span>
                              <span className="font-semibold text-gray-900">${budgetUsage.cost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Total Budget:</span>
                              <span className="font-semibold text-gray-900">${parseFloat(offer.total_budget).toFixed(2)}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-300">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-700">Budget Usage:</span>
                                <span className={`font-semibold ${budgetUsage.percentage > 100 ? 'text-red-600' : 'text-green-600'}`}>
                                  {budgetUsage.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${budgetUsage.percentage > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                                  style={{ width: `${Math.min(budgetUsage.percentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            {budgetUsage.remaining >= 0 ? (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Remaining Buffer:</span>
                                <span className="font-medium text-green-600">${budgetUsage.remaining.toFixed(2)}</span>
                              </div>
                            ) : (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                                <p className="text-sm text-red-700 flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  Estimated cost exceeds budget by ${Math.abs(budgetUsage.remaining).toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Validity Date */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Offer Valid Until *
                        </label>
                        <div className="relative group">
                          <input
                            type="date"
                            name="valid_until"
                            value={offer.valid_until}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 text-lg text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                            required
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          The freelancer must accept the offer before this date
                        </p>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Message (Optional)
                        </label>
                        <textarea
                          name="message"
                          value={offer.message}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none placeholder:text-gray-400"
                          rows="6"
                          placeholder="Add a personal message to explain the offer terms, expectations, or any special conditions..."
                          maxLength="1000"
                        />
                        <p className="text-sm text-gray-600">
                          {offer.message.length}/1000 characters
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-8 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          type="button"
                          onClick={() => router.push("http://localhost:3000/client/proposals")}
                          className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium hover:shadow-sm flex-1"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 flex-1"
                        >
                          {submitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Creating Offer...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Create Offer
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}