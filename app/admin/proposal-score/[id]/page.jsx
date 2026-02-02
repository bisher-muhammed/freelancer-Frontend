"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { apiPrivate } from "@/lib/apiPrivate";

export default function ProjectScoringConfigForm({ id: projectId }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [configId, setConfigId] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
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

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);

    apiPrivate
      .get(`project-scoring-config/?project=${projectId}`)
      .then((response) => {
        if (response.data && response.data.length > 0) {
          const config = response.data[0];
          setConfigId(config.id);
          reset({
            skill_weight: config.skill_weight,
            experience_weight: config.experience_weight,
            budget_weight: config.budget_weight,
            reliability_weight: config.reliability_weight,
            min_final_score: config.min_final_score,
            auto_reject_on_red_flags: config.auto_reject_on_red_flags,
          });
        }
      })
      .catch(() => console.log("No existing configuration, using defaults"))
      .finally(() => setIsLoading(false));
  }, [projectId, reset]);

  const onSubmit = async (data) => {
    if (!isWeightValid) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const payload = {
      project: projectId,
      skill_weight: parseFloat(data.skill_weight),
      experience_weight: parseFloat(data.experience_weight),
      budget_weight: parseFloat(data.budget_weight),
      reliability_weight: parseFloat(data.reliability_weight),
      min_final_score: parseInt(data.min_final_score),
      auto_reject_on_red_flags: data.auto_reject_on_red_flags,
    };

    try {
      if (configId) {
        await apiPrivate.put(`project-scoring-config/${configId}/`, payload);
      } else {
        const response = await apiPrivate.post("project-scoring-config/", payload);
        setConfigId(response.data.id);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Failed to save configuration. Please try again.";
      alert(errorMessage);
      console.error("Save error:", err.response?.data);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Scoring Configuration</h2>
        <p className="text-sm text-gray-600 mb-4">
          Configure scoring weights per metric. Total must sum to 1.0 (100%).
        </p>

        {/* Weights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Skill Weight", name: "skill_weight" },
            { label: "Experience Weight", name: "experience_weight" },
            { label: "Budget Weight", name: "budget_weight" },
            { label: "Reliability Weight", name: "reliability_weight" },
          ].map((w, idx) => (
            <div key={w.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{w.label}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register(w.name, { required: true, min: 0, max: 1, valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">
                  {(parseFloat(weights[idx] || 0) * 100).toFixed(0)}%
                </span>
              </div>
              {errors[w.name] && <p className="text-xs text-red-600 mt-1">Value must be 0–1</p>}
            </div>
          ))}
        </div>

        {/* Total Weight */}
        <div
          className={`p-3 rounded-md ${
            isWeightValid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex justify-between">
            <span className="text-sm font-medium">Total Weight</span>
            <span className={`font-bold ${isWeightValid ? "text-green-700" : "text-red-700"}`}>
              {totalWeight.toFixed(2)} ({(totalWeight * 100).toFixed(0)}%)
            </span>
          </div>
          {!isWeightValid && <p className="text-xs text-red-600 mt-1">Weights must sum to 1.0</p>}
        </div>

        {/* Thresholds */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Final Score</label>
          <input
            type="number"
            min="0"
            max="100"
            {...register("min_final_score", { required: true, min: 0, max: 100, valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Auto-reject */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("auto_reject_on_red_flags")}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Auto-reject on red flags</span>
              <p className="text-xs text-gray-600 mt-1">
                Automatically reject applicants with severe red flags.
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={isSaving || !isWeightValid}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Saving..." : configId ? "Update Configuration" : "Save Configuration"}
          </button>

          {saveSuccess && <span className="text-sm text-green-600 font-medium">✓ Saved successfully</span>}
        </div>
      </form>
    </div>
  );
}
