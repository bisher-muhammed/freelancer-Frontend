"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Calendar,
  MapPin 
} from "lucide-react";

export default function ProposalPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    cover_letter: "",
    bid_fixed_price: "",
    bid_hourly_rate: "",
  });

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await apiPrivate.get(`/project/${id}/`);
        setProject(res.data);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!form.cover_letter.trim()) {
      setError("Cover letter is required.");
      return;
    }
    
    if (form.cover_letter.trim().length < 100) {
      setError("Cover letter must be at least 100 characters.");
      return;
    }
    
    if (form.cover_letter.length > 2000) {
      setError("Cover letter cannot exceed 2000 characters.");
      return;
    }

    // Validate budget
    if (project?.budget_type === "fixed") {
      const amount = parseFloat(form.bid_fixed_price);
      if (!amount || amount <= 0 || isNaN(amount)) {
        setError("Please enter a valid bid amount.");
        return;
      }
    }

    if (project?.budget_type === "hourly") {
      const rate = parseFloat(form.bid_hourly_rate);
      if (!rate || rate <= 0 || isNaN(rate)) {
        setError("Please enter a valid hourly rate.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        project: id,
        cover_letter: form.cover_letter,
      };

      // Add appropriate bid field based on project type
      if (project.budget_type === "fixed") {
        payload.bid_fixed_price = parseFloat(form.bid_fixed_price);
      } else if (project.budget_type === "hourly") {
        payload.bid_hourly_rate = parseFloat(form.bid_hourly_rate);
      }

      // Submit proposal
      console.log("Submitting proposal with payload:", payload);
      
      const response = await apiPrivate.post("/proposal/apply/", payload);
      console.log("Proposal response:", response.data);

      // Check if response has success message
      const successMessage = response.data.detail || 
                            response.data.message || 
                            "Proposal submitted successfully!";
      
      setSuccess(successMessage);
      
      // Redirect based on your app structure
      // Options:
      // 1. Redirect to freelancer proposals page
      // 2. Redirect to project page
      // 3. Redirect to dashboard
      
      setTimeout(() => {
        // Try different routes - choose one based on your app
        try {
          // Option 1: Redirect to proposals list
          router.push("/freelancer/proposals");
          
        } catch (redirectError) {
          console.error("Redirect error:", redirectError);
          // If redirect fails, just go to home
        }
      }, 2000);

    } catch (err) {
      console.error("Submission error:", err);
      
      // Check for specific error cases
      if (err.response?.status === 401) {
        setError("Please log in to submit a proposal.");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }
      
      if (err.response?.status === 400) {
        // Handle validation errors
        const errorData = err.response.data;
        
        if (errorData.non_field_errors) {
          setError(errorData.non_field_errors.join(" "));
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (typeof errorData === 'object') {
          // Format field errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const fieldName = field.replace(/_/g, ' ');
              return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            })
            .join('. ');
          setError(fieldErrors || "Please check your input.");
        } else if (typeof errorData === 'string') {
          setError(errorData);
        } else {
          setError("Failed to submit proposal. Please check your input.");
        }
      } else if (err.response?.status === 409) {
        setError("You have already applied to this project.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600 mb-4" />
        <p className="text-gray-600">Loading project details...</p>
      </div>
    );
  }

  // Error state (project not found)
  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse Projects
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If project doesn't exist after loading
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Browse Projects
        </button>
      </div>
    );
  }

  // Check if user has already applied
  const alreadyApplied = project.already_applied || false;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Project</span>
        </button>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">{success}</p>
              <p className="text-sm mt-1">Redirecting to proposals page...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Already Applied Warning */}
        {alreadyApplied && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">You have already applied to this project</p>
                <p className="text-sm mt-1">You can view your application in your proposals.</p>
              </div>
            </div>
          </div>
        )}

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Posted {new Date(project.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {project.client?.city}, {project.client?.country}
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              {project.budget_type === 'fixed' ? 'Fixed Price' : 'Hourly'}
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed">{project.description}</p>
        </div>

        {/* Proposal Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Submit Your Proposal</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Letter */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Cover Letter <span className="text-red-500">*</span>
              </label>
              <textarea
                name="cover_letter"
                rows={8}
                value={form.cover_letter}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                placeholder="Explain why you're the best fit for this project. Include relevant experience, your approach, and any questions you have..."
                required
                disabled={alreadyApplied || submitting}
              />
              <div className="flex justify-between mt-2">
                <p className="text-sm text-gray-500">
                  Minimum 100 characters
                </p>
                <p className={`text-sm ${
                  form.cover_letter.length > 2000 ? 'text-red-500' : 
                  form.cover_letter.length > 1500 ? 'text-yellow-500' : 
                  'text-gray-500'
                }`}>
                  {form.cover_letter.length}/2000 characters
                </p>
              </div>
            </div>

            {/* Budget Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.budget_type === "fixed" && (
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Your Bid Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black">$</span>
                    <input
                      type="number"
                      name="bid_fixed_price"
                      value={form.bid_fixed_price}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-4 pl-8 focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                      placeholder="Enter your total bid"
                      min="1"
                      step="0.01"
                      required
                      disabled={alreadyApplied || submitting}
                    />
                  </div>
                  {project.fixed_budget && (
                    <p className="text-sm text-gray-500 mt-2">
                      Client's budget: ${parseFloat(project.fixed_budget).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {project.budget_type === "hourly" && (
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Your Hourly Rate ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="bid_hourly_rate"
                      value={form.bid_hourly_rate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-4 pl-8 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="Enter your hourly rate"
                      min="1"
                      step="0.01"
                      required
                      disabled={alreadyApplied || submitting}
                    />
                  </div>
                  {project.hourly_min_rate && project.hourly_max_rate && (
                    <p className="text-sm text-gray-500 mt-2">
                      Client's range: ${project.hourly_min_rate} - ${project.hourly_max_rate}/hr
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={alreadyApplied || submitting}
                className={`w-full py-4 rounded-lg font-medium text-lg transition-colors ${
                  alreadyApplied
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : submitting
                    ? "bg-gray-800 text-white cursor-wait"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {alreadyApplied ? (
                  "Already Applied"
                ) : submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Proposal...
                  </span>
                ) : (
                  "Submit Proposal"
                )}
              </button>
              <p className="text-sm text-gray-500 text-center mt-3">
                By submitting, you agree to our terms and conditions
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}