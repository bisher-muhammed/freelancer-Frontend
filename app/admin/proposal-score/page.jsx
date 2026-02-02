"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { apiPrivate } from "@/lib/apiPrivate";

export default function GlobalScoringConfigForm() {
  const [configs, setConfigs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      experience_level: "entry",
      skill_weight: 0.4,
      experience_weight: 0.3,
      budget_weight: 0.2,
      reliability_weight: 0.1,
      min_final_score: 50,
      auto_reject_on_red_flags: true,
    },
  });

  const weights = watch([
    "skill_weight",
    "experience_weight",
    "budget_weight",
    "reliability_weight",
  ]);

  const totalWeight = weights.reduce((sum, w) => sum + (parseFloat(w) || 0), 0);
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.01;

  const experienceLevels = [
    { value: "entry", label: "Entry Level" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
  ];

  // Load all configurations
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      console.log("Loading configurations from: /api/project-scoring-config/");
      
      const response = await apiPrivate.get("project-scoring-config/");
      console.log("API Response:", response.data);
      
      const data = response.data;
      
      // Handle both paginated (DRF) and direct array responses
      if (data.results && Array.isArray(data.results)) {
        setConfigs(data.results);
      } else if (Array.isArray(data)) {
        setConfigs(data);
      } else {
        setConfigs([]);
      }
    } catch (err) {
      console.error("Failed to load configurations:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      // Try alternative endpoint based on basename
      if (err.response?.status === 404) {
        console.log("Trying alternative endpoint: admin-proposal-score/");
        try {
          const altResponse = await apiPrivate.get("admin-proposal-score/");
          const altData = altResponse.data;
          
          if (altData.results && Array.isArray(altData.results)) {
            setConfigs(altData.results);
          } else if (Array.isArray(altData)) {
            setConfigs(altData);
          } else {
            setConfigs([]);
          }
        } catch (altErr) {
          alert(`Error loading configurations: ${err.message}. Please check the API endpoint.`);
          setConfigs([]);
        }
      } else {
        alert(`Error loading configurations: ${err.message}. Please check the API endpoint.`);
        setConfigs([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableLevels = () => {
    if (!Array.isArray(configs)) return experienceLevels;
    const usedLevels = configs.map((c) => c.experience_level);
    return experienceLevels.filter((level) => !usedLevels.includes(level.value));
  };

  const handleCreateNew = async () => {
    // Reload configs first to ensure we have latest data
    await loadConfigs();
    
    const available = getAvailableLevels();
    if (available.length === 0) {
      alert("All experience levels already have configurations. You can edit existing ones.");
      return;
    }
    
    setIsCreating(true);
    setEditingLevel(null);
    
    // Set the first available level
    const selectedLevel = available[0].value;
    
    reset({
      experience_level: selectedLevel,
      skill_weight: 0.4,
      experience_weight: 0.3,
      budget_weight: 0.2,
      reliability_weight: 0.1,
      min_final_score: 50,
      auto_reject_on_red_flags: true,
    });
  };

  const handleEdit = (config) => {
    setEditingLevel(config.experience_level);
    setIsCreating(false);
    reset({
      experience_level: config.experience_level,
      skill_weight: config.skill_weight,
      experience_weight: config.experience_weight,
      budget_weight: config.budget_weight,
      reliability_weight: config.reliability_weight,
      min_final_score: config.min_final_score,
      auto_reject_on_red_flags: config.auto_reject_on_red_flags,
    });
  };

  const handleDelete = async (level) => {
    if (!confirm(`Are you sure you want to delete the configuration for ${level}?`)) {
      return;
    }

    try {
      const config = configs.find((c) => c.experience_level === level);
      if (config) {
        // Try both possible endpoints
        try {
          await apiPrivate.delete(`project-scoring-config/${config.id}/`);
        } catch (err) {
          await apiPrivate.delete(`admin-proposal-score/${config.id}/`);
        }
        await loadConfigs();
        
        if (editingLevel === level) {
          setEditingLevel(null);
          setIsCreating(false);
        }
      }
    } catch (err) {
      alert("Failed to delete configuration.");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingLevel(null);
    setIsCreating(false);
    reset();
  };

  const onSubmit = async (data) => {
    if (!isWeightValid) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const payload = {
      experience_level: data.experience_level,
      skill_weight: parseFloat(data.skill_weight),
      experience_weight: parseFloat(data.experience_weight),
      budget_weight: parseFloat(data.budget_weight),
      reliability_weight: parseFloat(data.reliability_weight),
      min_final_score: parseInt(data.min_final_score),
      auto_reject_on_red_flags: data.auto_reject_on_red_flags,
    };

    try {
      // Check if config already exists for this experience level
      const existingConfig = Array.isArray(configs) 
        ? configs.find((c) => c.experience_level === data.experience_level)
        : null;

      let response;

      if (existingConfig && !editingLevel) {
        // If we're creating but config exists, use PUT to update
        try {
          response = await apiPrivate.put(`project-scoring-config/${existingConfig.id}/`, payload);
        } catch (err) {
          response = await apiPrivate.put(`admin-proposal-score/${existingConfig.id}/`, payload);
        }
      } else if (editingLevel) {
        // We're explicitly editing
        const config = configs.find((c) => c.experience_level === editingLevel);
        try {
          response = await apiPrivate.put(`project-scoring-config/${config.id}/`, payload);
        } catch (err) {
          response = await apiPrivate.put(`admin-proposal-score/${config.id}/`, payload);
        }
      } else {
        // No existing config, create new one
        try {
          response = await apiPrivate.post("project-scoring-config/", payload);
        } catch (err) {
          response = await apiPrivate.post("admin-proposal-score/", payload);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      await loadConfigs();
      setEditingLevel(null);
      setIsCreating(false);
    } catch (err) {
      console.error("Save error details:", err.response?.data);
      
      // If we get duplicate error, try to fetch and update instead
      if (err.response?.data?.experience_level?.[0]?.includes("already exists")) {
        try {
          // Reload configs to get the latest data
          await loadConfigs();
          const existingConfig = configs.find(
            (c) => c.experience_level === data.experience_level
          );
          
          if (existingConfig) {
            // Retry with PUT
            try {
              await apiPrivate.put(`project-scoring-config/${existingConfig.id}/`, payload);
            } catch (err) {
              await apiPrivate.put(`admin-proposal-score/${existingConfig.id}/`, payload);
            }
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            await loadConfigs();
            setEditingLevel(null);
            setIsCreating(false);
            return;
          }
        } catch (retryErr) {
          console.error("Retry failed:", retryErr);
        }
      }
      
      const message =
        err.response?.data?.detail ||
        err.response?.data?.experience_level?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        "Failed to save configuration.";
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
          <p className="text-center text-slate-600 mt-4">Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Project Scoring Configurations
          </h1>
          <p className="text-base text-slate-700 mt-2">
            Manage scoring rules for each experience level (unique per level)
          </p>
        </div>
        {!isCreating && !editingLevel && getAvailableLevels().length > 0 && (
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            + Create New Config
          </button>
        )}
      </div>

      {/* Debug info - you can remove this after testing */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          Loaded {configs.length} configuration(s). 
          Available levels: {getAvailableLevels().map(l => l.label).join(", ")}
        </p>
      </div>

      {/* Existing Configurations List */}
      {Array.isArray(configs) && configs.length > 0 && !isCreating && !editingLevel && (
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 mb-6">
          <div className="p-5 border-b-2 border-blue-200 bg-blue-50">
            <h2 className="text-lg font-bold text-slate-900">Existing Configurations</h2>
            <p className="text-sm text-slate-600 mt-1">
              Click Edit to modify any configuration
            </p>
          </div>
          <div className="divide-y-2 divide-blue-100">
            {configs.map((config) => (
              <div
                key={config.id}
                className="p-5 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 capitalize">
                      {config.experience_level} Level
                    </h3>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <span className="font-bold text-indigo-900">Skills:</span>{" "}
                        <span className="text-indigo-700 font-semibold">
                          {(config.skill_weight * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <span className="font-bold text-purple-900">Experience:</span>{" "}
                        <span className="text-purple-700 font-semibold">
                          {(config.experience_weight * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                        <span className="font-bold text-teal-900">Budget:</span>{" "}
                        <span className="text-teal-700 font-semibold">
                          {(config.budget_weight * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <span className="font-bold text-amber-900">Reliability:</span>{" "}
                        <span className="text-amber-700 font-semibold">
                          {(config.reliability_weight * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-4 text-sm">
                      <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                        <span className="font-bold text-emerald-900">Min Score:</span>{" "}
                        <span className="text-emerald-700 font-semibold">{config.min_final_score}</span>
                      </div>
                      <div className="bg-rose-50 px-4 py-2 rounded-lg border border-rose-200">
                        <span className="font-bold text-rose-900">Auto-reject:</span>{" "}
                        <span className="text-rose-700 font-semibold">
                          {config.auto_reject_on_red_flags ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <button
                      onClick={() => handleEdit(config)}
                      className="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow hover:shadow-md transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(config.experience_level)}
                      className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 shadow hover:shadow-md transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingLevel) && (
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {editingLevel ? `Edit ${editingLevel} Configuration` : "Create New Configuration"}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Experience Level */}
            <div>
              <label className="block text-base font-bold text-slate-900 mb-2">
                Experience Level
              </label>
              {editingLevel ? (
                <div className="px-4 py-3 bg-blue-100 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold capitalize">
                  {editingLevel}
                </div>
              ) : (
                <>
                  <select
                    {...register("experience_level")}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getAvailableLevels().map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {getAvailableLevels().length === 0 && (
                    <p className="text-sm text-red-600 mt-2 font-semibold">
                      All experience levels are already configured. Please edit existing ones.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Weight Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Skill Weight", name: "skill_weight", desc: "Technical skills matter", color: "indigo" },
                { label: "Experience Weight", name: "experience_weight", desc: "Past experience matters", color: "purple" },
                { label: "Budget Weight", name: "budget_weight", desc: "Budget alignment matters", color: "teal" },
                { label: "Reliability Weight", name: "reliability_weight", desc: "Track record matters", color: "amber" },
              ].map((w, idx) => (
                <div key={w.name}>
                  <label className="block text-base font-bold text-slate-900 mb-2">
                    {w.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      {...register(w.name, { required: true, valueAsNumber: true })}
                      className="w-full px-4 py-3 pr-16 border-2 border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className={`absolute right-4 top-3 px-2 py-1 rounded text-sm font-bold ${
                      w.color === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                      w.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                      w.color === 'teal' ? 'bg-teal-100 text-teal-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {(parseFloat(weights[idx] || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1 font-medium">{w.desc}</p>
                </div>
              ))}
            </div>

            {/* Total Weight Indicator */}
            <div
              className={`p-4 rounded-lg border-2 ${
                isWeightValid
                  ? "bg-green-100 border-green-400"
                  : "bg-red-100 border-red-400"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Total Weight:</span>
                <span
                  className={`text-2xl font-bold ${
                    isWeightValid ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {totalWeight.toFixed(2)} ({(totalWeight * 100).toFixed(0)}%)
                </span>
              </div>
              {!isWeightValid && (
                <p className="text-sm text-red-700 mt-2 font-semibold">
                  ⚠ Weights must sum to exactly 1.0
                </p>
              )}
            </div>

            {/* Minimum Final Score */}
            <div>
              <label className="block text-base font-bold text-slate-900 mb-2">
                Minimum Final Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                {...register("min_final_score", { required: true, valueAsNumber: true })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-slate-700 mt-1 font-medium">
                Proposals below this score will be flagged
              </p>
            </div>

            {/* Auto-Reject */}
            <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("auto_reject_on_red_flags")}
                  className="mt-1 w-5 h-5 text-blue-600 border-2 border-slate-400 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-base font-bold text-slate-900">
                    Auto-reject on red flags
                  </span>
                  <p className="text-sm text-slate-700 mt-1 font-medium">
                    Automatically reject proposals with identified red flags
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t-2 border-blue-200">
              <button
                type="submit"
                disabled={isSaving || !isWeightValid}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
              >
                {isSaving
                  ? "Saving..."
                  : editingLevel
                  ? "Update Configuration"
                  : "Create Configuration"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-slate-300 text-slate-900 font-bold rounded-lg hover:bg-slate-400 shadow-md hover:shadow-lg transition-all"
              >
                Cancel
              </button>

              {saveSuccess && (
                <span className="text-base text-green-600 font-bold flex items-center gap-2">
                  ✓ Saved successfully
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {Array.isArray(configs) && configs.length === 0 && !isCreating && !editingLevel && (
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-12 text-center">
          <div className="text-blue-400 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            No configurations yet
          </h3>
          <p className="text-base text-slate-700 mb-6 font-medium">
            Create your first scoring configuration for an experience level
          </p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            Create First Configuration
          </button>
        </div>
      )}
    </div>
  );
}