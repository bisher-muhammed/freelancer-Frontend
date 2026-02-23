"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useFieldArray } from "react-hook-form";
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  Upload,
  FileText,
  Plus,
  X,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Phone,
  DollarSign,
  Award,
  ExternalLink,
  Edit2,
  Trash2,
  FolderOpen,
  ChevronRight,
  Calendar,
  Link2,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  Layers,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Figma,
  Code,
  Palette,
  PenTool,
  Camera as CameraIcon,
  Music,
  Video,
  BookOpen,
  Coffee,
  Heart,
  Star,
  MapPin,
  Globe2,
  Users,
  Target,
  Zap,
  Download,
  Eye,
  EyeOff,
  Settings,
  LogOut,
  HelpCircle,
  ChevronLeft,
  ChevronDown,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  Copy,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Send,
  Paperclip,
  Image,
  Link,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Bell,
  BellOff,
  Lock,
  Unlock,
  Key,
  CreditCard,
  Wallet,
  BarChart,
  PieChart,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  Radio,
  Podcast,
  Film,
  Clapperboard,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  WatchIcon,
  Airplay,
  Cast,
  Gamepad2,
  Joystick,
  Dices,
  Puzzle,
  Shapes,
  Blocks,
  BrickWall,
  Wallpaper,
  Palette as PaletteIcon,
  Brush,
  Pencil,
  Eraser,
  Paintbrush,
  PaintBucket,
  SprayCan,
  Stamp,
  Type,
  TextCursor,
  Baseline,
  Subscript,
  Superscript,
  Sigma,
  Omega,
  Pi,
  Infinity,
  Triangle,
  Square,
  Circle,
  Hexagon,
  Octagon,
  Pentagon,
  Diamond,
  Shield as ShieldIcon,
  Sword,
  Axe,
  Hammer,
  Pickaxe,
  Shovel,
  Wrench,
  Screwdriver,
  Saw,
  Drill,
  Tool,
  Cog,
  Wrench as WrenchIcon,
  Nut,
  NutOff,
  Bolt,
  Cable,
  Plug,
  PlugZap,
  Power,
  PowerOff,
  ZapOff,
  Flame,
  FlameKindling,
  Droplet,
  Droplets,
  Wind,
  Tornado,
  Hurricane,
  Snowflake,
  Cloud,
  Cloudy,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudHail,
  CloudFog,
  SunSnow,
  SunMedium,
  SunDim,
  Sunset,
  Sunrise,
  MoonStar,
  Stars,
  Sparkle,
  Sparkles as SparklesIcon,
  Flower,
  Leaf,
  TreePalm,
  TreeDeciduous,
  TreeConiferous,
  Trees,
  PalmTree,
  Cactus,
  Grass,
  Clover,
  Wheat,
  Corn,
  Apple,
  Banana,
  Citrus,
  Grape,
  Watermelon,
  Melon,
  Pear,
  Peach,
  Cherry,
  Strawberry,
  Pineapple,
  Coconut,
  Kiwi,
  Tomato,
  Carrot,
  Broccoli,
  Cucumber,
  Pepper,
  Chili,
  Garlic,
  Onion,
  Potato,
  SweetPotato,
  Eggplant,
  Mushroom,
  Coffee as CoffeeIcon,
  Tea,
  Beer,
  Wine,
  Cocktail,
  Martini,
  GlassWater,
  Glass,
  CupSoda,
  Bottle,
  BottleSoda,
  Milk,
  Juice,
  Smoothie,
  IceCream,
  Cake,
  Cookie,
  Candy,
  Lollipop,
  Donut,
  Pizza,
  Burger,
  Fries,
  HotDog,
  Sandwich,
  Taco,
  Burrito,
  Sushi,
  Rice,
  Noodles,
  Soup,
  Stew,
  Fish,
  Shrimp,
  Lobster,
  Crab,
  Octopus as OctopusIcon,
  Squid,
  Shell,
  Egg,
  EggFried,
  Bacon,
  Meat,
  Chicken,
  Turkey,
  Duck,
  Goose,
  Rabbit,
  Cat,
  Dog,
  Fish as FishIcon,
  Bird,
  Penguin,
  Cow,
  Pig,
  Horse,
  Donkey,
  Sheep,
  Goat,
  Camel,
  Llama,
  Elephant,
  Rhino,
  Hippo,
  Giraffe,
  Zebra,
  Deer,
  Moose,
  Bear,
  Panda,
  Koala,
  Kangaroo,
  Monkey,
  Gorilla,
  Frog,
  Snake,
  Lizard,
  Turtle,
  Crocodile,
  Dino,
  Dragon,
  Unicorn,
  Pegasus,
  Phoenix,
  Griffin,
  Sphinx,
  Cerberus,
  Hydra,
  Kraken,
  Leviathan,
  Behemoth,
  Chimera,
  Mermaid,
  Fairy,
  Elf,
  Dwarf,
  Orc,
  Goblin,
  Troll,
  Ogre,
  Giant,
  Cyclops,
  Minotaur,
  Centaur,
  Satyr,
  Faun,
  Nymph,
  Dryad,
  Hamadryad,
  Naiad,
  Nereid,
  Oceanid,
  Oread,
  Epimeliad,
  Aurai,
  Nephele,
  Asteria,
  Hesperides,
  Pleiades,
  Hyades,
  Hyas,
  Atlas,
  Prometheus,
  Epimetheus,
  Pandora,
  Deucalion,
  Pyrrha,
  Hellen,
  Aeolus,
  Zephyrus,
  Boreas,
  Notus,
  Eurus,
  Iris,
  Arke,
  Nike,
  Bia,
  Kratos,
  Zelus,
  Selene,
  Helios,
  Eos,
  Nyx,
  Hemera,
  Aether,
  Chaos,
  Erebus,
  Tartarus,
  Gaia,
  Uranus,
  Pontus,
  Thalassa,
  Nereus,
  Proteus,
  Triton,
  Phorcys,
  Ceto,
  Eurybia,
  Aegaeon,
  Briareos,
  Cottus,
  Gyges,
  Hecatoncheires,
  Cyclopes,
  Arges,
  Brontes,
  Steropes,
  Titans,
  Oceanus,
  Coeus,
  Crius,
  Hyperion,
  Iapetus,
  Theia,
  Rhea,
  Themis,
  Mnemosyne,
  Phoebe,
  Tethys,
  Cronus,
  Hestia,
  Demeter,
  Hera,
  Hades,
  Poseidon,
  Zeus,
  Athena,
  Apollo,
  Artemis,
  Hermes,
  Dionysus,
  Persephone,
  Hephaestus,
  Ares,
  Aphrodite,
  Eros,
  Anteros,
  Himeros,
  Pothos,
  Hymen,
  Ilythia,
  Hebe,
  Ganymede,
  Asclepius,
  Hygieia,
  Panacea,
  Iaso,
  Aceso,
  Aglaia,
  Euphrosyne,
  Thalia,
  Charites,
  Graces,
  Muses,
  Calliope,
  Clio,
  Erato,
  Euterpe,
  Melpomene,
  Polyhymnia,
  Terpsichore,
  Thalia as ThaliaIcon,
  Urania,
  Fates,
  Clotho,
  Lachesis,
  Atropos,
  Furies,
  Alecto,
  Megaera,
  Tisiphone,
  Gorgons,
  Stheno,
  Euryale,
  Medusa,
  Graeae,
  Deino,
  Enyo,
  Pemphredo,
  Hesperides as HesperidesIcon,
  Aegle,
  Erytheia,
  Hesperia,
  Arethusa,
  Hesperethusa,
} from "lucide-react";
import {
  fetchFreelancerProfile,
  updateFreelancerProfile,
  clearSuccessMessage,
  clearError,
  fetchPortfolioProjects,
  createPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,
} from "../../store/slices/freelancerProfileSlice";

export default function FreelancerProfileForm() {
  const dispatch = useDispatch();
  const { 
    data: profile, 
    loading, 
    successMessage, 
    error,
    portfolio,
    portfolioLoading,
    portfolioError,
  } = useSelector((state) => state.freelancerProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [profilePreview, setProfilePreview] = useState(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [resumeFileName, setResumeFileName] = useState(null);
  const imageInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const formRef = useRef(null);

  const { register, control, handleSubmit, setValue, reset, watch, formState: { errors, isDirty, dirtyFields } } = useForm({
    defaultValues: {
      title: "",
      bio: "",
      contact_number: "",
      hourly_rate: "",
      profile_picture: null,
      resume: null,
      categories: "",
      skills: "",
      education: [],
      experience: [],
    },
    mode: "onChange",
  });

  // Portfolio form
  const { 
    register: registerPortfolio, 
    handleSubmit: handlePortfolioSubmit, 
    reset: resetPortfolio, 
    formState: { errors: portfolioErrors, isSubmitting: portfolioSubmitting } 
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      link: "",
    },
    mode: "onChange",
  });

  // Education & Experience field arrays
  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
    move: moveEducation,
  } = useFieldArray({ 
    control, 
    name: "education",
    keyName: "id"
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
    move: moveExperience,
  } = useFieldArray({ 
    control, 
    name: "experience",
    keyName: "id"
  });

  // Watch profile picture for preview
  const profilePicture = watch("profile_picture");
  const watchResume = watch("resume");

  // Load profile and portfolio on mount
  useEffect(() => {
    dispatch(fetchFreelancerProfile());
    dispatch(fetchPortfolioProjects());
  }, [dispatch]);

  // Auto-dismiss messages with animation
  useEffect(() => {
    if (successMessage) {
      setShowSuccessAnimation(true);
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        setShowSuccessAnimation(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error || portfolioError) {
      const timer = setTimeout(() => dispatch(clearError()), 8000);
      return () => clearTimeout(timer);
    }
  }, [error, portfolioError, dispatch]);

  // Set form values when profile data arrives
  useEffect(() => {
    if (!profile) return;

    reset({
      title: profile.title || "",
      bio: profile.bio || "",
      contact_number: profile.contact_number || "",
      hourly_rate: profile.hourly_rate || "",
      categories: Array.isArray(profile.categories_names) 
        ? profile.categories_names.join(", ")
        : "",
      skills: Array.isArray(profile.skills_names)
        ? profile.skills_names.join(", ")
        : "",
      education: profile.education || [],
      experience: profile.experience || [],
    });

    if (profile.profile_picture) {
      setProfilePreview(profile.profile_picture);
    }

    if (profile.resume) {
      setResumeFileName(profile.resume.split('/').pop());
    }
  }, [profile, reset]);

  // Handle profile picture preview
  useEffect(() => {
    if (profilePicture && profilePicture.length > 0) {
      const file = profilePicture[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setProfilePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  }, [profilePicture]);

  // Handle resume file name display
  useEffect(() => {
    if (watchResume && watchResume.length > 0) {
      setResumeFileName(watchResume[0].name);
    }
  }, [watchResume]);

  // Portfolio modal handlers
  const handleOpenPortfolioModal = useCallback((project = null) => {
    if (project) {
      setEditingPortfolio(project);
      resetPortfolio({
        title: project.title,
        description: project.description,
        link: project.link || "",
      });
    } else {
      setEditingPortfolio(null);
      resetPortfolio({ title: "", description: "", link: "" });
    }
    setShowPortfolioModal(true);
  }, [resetPortfolio]);

  const handleClosePortfolioModal = useCallback(() => {
    setShowPortfolioModal(false);
    setEditingPortfolio(null);
    resetPortfolio({ title: "", description: "", link: "" });
  }, [resetPortfolio]);

  const handlePortfolioFormSubmit = useCallback(async (data) => {
    try {
      if (editingPortfolio) {
        await dispatch(updatePortfolioProject({ id: editingPortfolio.id, projectData: data })).unwrap();
      } else {
        await dispatch(createPortfolioProject(data)).unwrap();
      }
      await dispatch(fetchPortfolioProjects());
      handleClosePortfolioModal();
    } catch (error) {
      console.error("Portfolio operation failed:", error);
    }
  }, [dispatch, editingPortfolio, handleClosePortfolioModal]);

  const handleDeletePortfolio = useCallback((id) => {
    setShowDeleteConfirm(id);
  }, []);

  const confirmDeletePortfolio = useCallback(async (id) => {
    try {
      await dispatch(deletePortfolioProject(id)).unwrap();
      await dispatch(fetchPortfolioProjects());
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete portfolio project:", error);
    }
  }, [dispatch]);

  const handleResumeUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert("Please upload a PDF, DOC, or DOCX file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }
    
    setValue("resume", e.target.files, { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  const handleProfilePictureClick = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    
    if (!allowedImageTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG, GIF, WebP, or AVIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const fileList = dataTransfer.files;

    setValue("profile_picture", fileList, { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  const removeProfilePicture = useCallback(() => {
    setProfilePreview(null);
    setValue("profile_picture", null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }, [setValue]);

  const removeResume = useCallback(() => {
    setResumeFileName(null);
    setValue("resume", null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  }, [setValue]);

  const onSubmit = useCallback(async (formData) => {
    // Process skills
    let skillsArray = [];
    if (formData.skills) {
      if (typeof formData.skills === 'string') {
        skillsArray = formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (Array.isArray(formData.skills)) {
        skillsArray = formData.skills.map(s => String(s).trim()).filter(Boolean);
      }
    }

    // Process categories
    let categoriesArray = [];
    if (formData.categories) {
      if (typeof formData.categories === 'string') {
        categoriesArray = formData.categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      } else if (Array.isArray(formData.categories)) {
        categoriesArray = formData.categories.map(c => String(c).trim()).filter(Boolean);
      }
    }

    // Clean up experience
    let cleanedExperience = [];
    if (formData.experience && Array.isArray(formData.experience)) {
      cleanedExperience = formData.experience
        .filter(exp => exp && typeof exp === 'object' && !Array.isArray(exp))
        .map(exp => ({
          company: String(exp.company || ""),
          role: String(exp.role || ""),
          start_date: String(exp.start_date || ""),
          end_date: exp.end_date && String(exp.end_date).trim() !== "" ? String(exp.end_date) : null
        }));
    }

    // Clean up education
    let cleanedEducation = [];
    if (formData.education && Array.isArray(formData.education)) {
      cleanedEducation = formData.education
        .filter(edu => edu && typeof edu === 'object' && !Array.isArray(edu))
        .map(edu => ({
          degree: String(edu.degree || ""),
          institution: String(edu.institution || ""),
          year_completed: String(edu.year_completed || "")
        }));
    }

    const manualData = {
      title: String(formData.title || ""),
      bio: String(formData.bio || ""),
      contact_number: String(formData.contact_number || ""),
      hourly_rate: String(formData.hourly_rate || ""),
      skills: skillsArray,
      categories: categoriesArray,
      education: cleanedEducation,
      experience: cleanedExperience,
    };

    const files = {};
    
    if (formData.profile_picture && formData.profile_picture.length > 0) {
      files.profilePicture = formData.profile_picture[0];
    } else if (profilePreview === null && profile?.profile_picture) {
      files.profilePicture = null;
    }
    
    if (formData.resume && formData.resume.length > 0) {
      files.resume = formData.resume[0];
    } else if (resumeFileName === null && profile?.resume) {
      files.resume = null;
    }

    try {
      await dispatch(updateFreelancerProfile({ manualData, files })).unwrap();
      await dispatch(fetchFreelancerProfile());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }, [dispatch, profilePreview, profile, resumeFileName]);

  const navigationItems = [
    { id: "personal", label: "Personal Info", icon: User, description: "Basic details & contact" },
    { id: "professional", label: "Professional Info", icon: Award, description: "Title, bio & rate" },
    { id: "skills", label: "Skills & Categories", icon: Briefcase, description: "Your expertise areas" },
    { id: "education", label: "Education", icon: GraduationCap, description: "Academic background" },
    { id: "experience", label: "Experience", icon: FileText, description: "Work history" },
    { id: "portfolio", label: "Portfolio", icon: FolderOpen, description: "Showcase your work" },
  ];

  // Calculate profile completion
  const calculateCompletion = useCallback(() => {
    let completed = 0;
    const total = 9;
    
    if (watch("title")?.length > 0) completed++;
    if (watch("bio")?.length >= 10) completed++;
    if (watch("contact_number")?.length > 0) completed++;
    if (watch("hourly_rate")?.length > 0) completed++;
    if (watch("skills")?.length > 0) completed++;
    if (watch("categories")?.length > 0) completed++;
    if (watch("education")?.length > 0) completed++;
    if (watch("experience")?.length > 0) completed++;
    if (Array.isArray(portfolio) && portfolio.length > 0) completed++;

    return Math.round((completed / total) * 100);
  }, [watch, portfolio]);

  const completionPercentage = calculateCompletion();

  // Validation: Check if minimum required fields are filled
  const isProfileValid = useCallback(() => {
    const hasTitle = watch("title")?.length >= 2;
    const hasBio = watch("bio")?.length >= 10;
    const hasContact = watch("contact_number")?.length > 0;
    const hasRate = watch("hourly_rate") > 0;
    const hasSkills = watch("skills")?.split(",").filter(s => s.trim()).length > 0;
    const hasCategories = watch("categories")?.split(",").filter(c => c.trim()).length > 0;
    
    return hasTitle && hasBio && hasContact && hasRate && hasSkills && hasCategories;
  }, [watch]);

  const getUsername = useCallback(() => {
    if (!profile?.user) return "Loading...";
    if (typeof profile.user === 'string') {
      return profile.user.split(' (')[0];
    }
    return profile.user.username || "User";
  }, [profile]);

  const getEmail = useCallback(() => {
    if (!profile) return "Loading...";
    return profile.email || profile.user?.email || "Email not available";
  }, [profile]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showPortfolioModal) {
        handleClosePortfolioModal();
      }
      if (e.key === 'Escape' && showDeleteConfirm) {
        setShowDeleteConfirm(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditing && isProfileValid() && isDirty) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPortfolioModal, showDeleteConfirm, isEditing, isProfileValid, isDirty, handleClosePortfolioModal]);

  return (
    <div className="min-h-screen bg-white">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#227C70]/5 animate-pulse"></div>
          <div className="relative bg-white rounded-full p-4 shadow-2xl animate-bounce">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingPortfolio ? "Edit Portfolio Project" : "Add Portfolio Project"}
                </h3>
                <button
                  onClick={handleClosePortfolioModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handlePortfolioSubmit(handlePortfolioFormSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...registerPortfolio("title", { 
                      required: "Title is required",
                      minLength: { value: 2, message: "Title must be at least 2 characters" },
                      maxLength: { value: 100, message: "Title must not exceed 100 characters" }
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 focus:border-[#227C70] transition-all text-gray-900 ${
                      portfolioErrors.title ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="e.g., E-commerce Platform Redesign"
                    disabled={portfolioSubmitting}
                  />
                  {portfolioErrors.title && (
                    <p className="text-sm text-red-600 mt-2">{portfolioErrors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...registerPortfolio("description", { 
                      required: "Description is required",
                      minLength: { value: 10, message: "Description must be at least 10 characters" },
                      maxLength: { value: 1000, message: "Description must not exceed 1000 characters" }
                    })}
                    rows={4}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 focus:border-[#227C70] transition-all resize-none text-gray-900 ${
                      portfolioErrors.description ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="Describe your project, technologies used, and your role..."
                    disabled={portfolioSubmitting}
                  />
                  {portfolioErrors.description && (
                    <p className="text-sm text-red-600 mt-2">{portfolioErrors.description.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {registerPortfolio("description").value?.length || 0}/1000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Link
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...registerPortfolio("link", {
                        pattern: {
                          value: /^https?:\/\/.+/,
                          message: "Please enter a valid URL (starting with http:// or https://)"
                        }
                      })}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 focus:border-[#227C70] transition-all text-gray-900 ${
                        portfolioErrors.link ? "border-red-300" : "border-gray-200"
                      }`}
                      placeholder="https://github.com/your-project"
                      disabled={portfolioSubmitting}
                    />
                  </div>
                  {portfolioErrors.link && (
                    <p className="text-sm text-red-600 mt-2">{portfolioErrors.link.message}</p>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClosePortfolioModal}
                    className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    disabled={portfolioSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={portfolioSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#227C70] text-white rounded-xl hover:bg-[#1a6357] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {portfolioSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingPortfolio ? "Update Project" : "Add Project"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Portfolio Project</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeletePortfolio(showDeleteConfirm)}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-sm hover:shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
              <p className="text-gray-600">Manage your freelancer profile and showcase your expertise</p>
            </div>
            
            {/* Profile Completion Badge */}
            <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Profile Strength</p>
                  <p className="text-2xl font-bold text-[#227C70]">{completionPercentage}%</p>
                </div>
                <div className="w-24 h-24 relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      className="text-gray-200"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="48"
                      cy="48"
                    />
                    <circle
                      className="text-[#227C70] transition-all duration-1000 ease-out"
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="48"
                      cy="48"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {completionPercentage === 100 ? (
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    ) : (
                      <TrendingUp className="h-6 w-6 text-[#227C70]" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {(error || portfolioError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-slideDown">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800 flex-1">{error || portfolioError}</p>
              <button
                onClick={() => dispatch(clearError())}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-slideDown">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-green-800 flex-1">{successMessage}</p>
              <button
                onClick={() => dispatch(clearSuccessMessage())}
                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                aria-label="Dismiss message"
              >
                <X className="h-4 w-4 text-green-500" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24 shadow-sm">
              {/* User Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#227C70] to-[#1a6357] rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                      {profilePreview ? (
                        <img 
                          src={profilePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-7 w-7 text-white" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{getUsername()}</p>
                    <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      {getEmail()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    onMouseEnter={() => setHoveredSection(item.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                    className={`w-full group relative overflow-hidden ${
                      activeSection === item.id
                        ? "bg-[#227C70] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    } rounded-xl transition-all duration-200`}
                    aria-current={activeSection === item.id ? "true" : "false"}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className={`relative ${
                        activeSection === item.id ? "text-white" : "text-gray-500"
                      }`}>
                        <item.icon className="h-5 w-5" />
                        {hoveredSection === item.id && activeSection !== item.id && (
                          <div className="absolute inset-0 animate-ping">
                            <item.icon className="h-5 w-5 text-[#227C70]/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{item.label}</p>
                        <p className={`text-xs ${
                          activeSection === item.id ? "text-white/80" : "text-gray-500"
                        }`}>
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-all duration-200 ${
                        activeSection === item.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                      }`} />
                    </div>
                    {activeSection === item.id && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-white"></div>
                    )}
                  </button>
                ))}
              </nav>

              {/* Status Cards */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Verified Account</p>
                    <p className="text-xs text-gray-600">Email confirmed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Clock className="h-5 w-5 text-[#227C70]" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Member Since</p>
                    <p className="text-xs text-gray-600">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "2024"}
                    </p>
                  </div>
                </div>
                {isEditing && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Edit Mode</p>
                      <p className="text-xs text-gray-600">Ctrl+S to save changes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-9">
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              {activeSection === "personal" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <User className="h-5 w-5 text-[#227C70]" />
                        Personal Information
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">Update your personal details and contact information</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 text-sm font-medium text-[#227C70] hover:bg-[#227C70]/5 rounded-lg transition-all"
                    >
                      {isEditing ? "Cancel Editing" : "Edit Profile"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Picture */}
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-6">
                        <div 
                          className={`relative w-28 h-28 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed transition-all cursor-pointer group overflow-hidden ${
                            isEditing 
                              ? "border-gray-300 hover:border-[#227C70] hover:bg-[#227C70]/5" 
                              : "border-gray-200 cursor-default"
                          }`}
                          onClick={isEditing ? handleProfilePictureClick : undefined}
                          role={isEditing ? "button" : "presentation"}
                          tabIndex={isEditing ? 0 : -1}
                          onKeyDown={isEditing ? (e) => e.key === 'Enter' && handleProfilePictureClick() : undefined}
                        >
                          {profilePreview ? (
                            <>
                              <img 
                                src={profilePreview} 
                                alt="Profile preview" 
                                className="w-full h-full object-cover"
                              />
                              {isEditing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Camera className="h-8 w-8 text-white" />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center">
                              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-500">Upload photo</p>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          {profilePreview ? (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-700">Photo uploaded</p>
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={removeProfilePicture}
                                  className="text-sm text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                                >
                                  <X className="h-4 w-4" />
                                  Remove photo
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-sm text-gray-700">No photo yet</p>
                              <p className="text-xs text-gray-500">Upload a professional photo</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <input
                        ref={imageInputRef}
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif"
                        className="hidden"
                        disabled={!isEditing}
                        aria-label="Upload profile picture"
                      />
                    </div>

                    {/* Resume Upload */}
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Resume / CV
                      </label>
                      <div className="space-y-3">
                        {resumeFileName && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                            <FileText className="h-5 w-5 text-[#227C70]" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {resumeFileName}
                              </p>
                              {profile?.resume && !isEditing && (
                                <a 
                                  href={profile.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#227C70] hover:text-[#1a6357] transition-colors inline-flex items-center gap-1"
                                >
                                  View Resume <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            {isEditing && (
                              <button
                                onClick={removeResume}
                                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                aria-label="Remove resume"
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </button>
                            )}
                          </div>
                        )}
                        {isEditing && (
                          <div className="relative">
                            <input
                              ref={resumeInputRef}
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleResumeUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              aria-label="Upload resume"
                            />
                            <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#227C70] transition-colors">
                              <Upload className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">Click to upload</p>
                                <p className="text-xs text-gray-500">PDF or DOCX (max 5MB)</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register("contact_number", {
                          required: "Contact number is required",
                          pattern: {
                            value: /^\+?1?\d{9,15}$/,
                            message: "Enter a valid contact number"
                          }
                        })}
                        type="tel"
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all text-gray-900 ${
                          errors.contact_number ? "border-red-300" : "border-gray-200"
                        } ${!isEditing && "bg-gray-100 cursor-not-allowed"}`}
                        placeholder="+1 (234) 567-890"
                        disabled={!isEditing}
                        aria-invalid={errors.contact_number ? "true" : "false"}
                      />
                    </div>
                    {errors.contact_number && (
                      <p className="text-sm text-red-600 mt-2" role="alert">{errors.contact_number.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Professional Section */}
              {activeSection === "professional" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Award className="h-5 w-5 text-[#227C70]" />
                      Professional Information
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Tell clients about your professional background</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("title", { 
                          required: "Title is required",
                          minLength: { value: 2, message: "Title must be at least 2 characters" },
                          maxLength: { value: 100, message: "Title must not exceed 100 characters" }
                        })}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all text-gray-900 ${
                          errors.title ? "border-red-300" : "border-gray-200"
                        } ${!isEditing && "bg-gray-100 cursor-not-allowed"}`}
                        placeholder="e.g., Senior Full Stack Developer"
                        disabled={!isEditing}
                        aria-invalid={errors.title ? "true" : "false"}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 mt-2" role="alert">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate (USD) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("hourly_rate", {
                            required: "Hourly rate is required",
                            min: { value: 0.01, message: "Rate must be greater than 0" },
                            max: { value: 10000, message: "Rate must not exceed 10000" }
                          })}
                          type="number"
                          step="0.01"
                          className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all text-gray-900 ${
                            errors.hourly_rate ? "border-red-300" : "border-gray-200"
                          } ${!isEditing && "bg-gray-100 cursor-not-allowed"}`}
                          placeholder="50.00"
                          disabled={!isEditing}
                          aria-invalid={errors.hourly_rate ? "true" : "false"}
                        />
                      </div>
                      {errors.hourly_rate && (
                        <p className="text-sm text-red-600 mt-2" role="alert">{errors.hourly_rate.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Bio <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register("bio", { 
                        required: "Bio is required",
                        minLength: { value: 10, message: "Bio must be at least 10 characters" },
                        maxLength: { value: 2000, message: "Bio must not exceed 2000 characters" }
                      })}
                      rows={6}
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all resize-none text-gray-900 ${
                        errors.bio ? "border-red-300" : "border-gray-200"
                      } ${!isEditing && "bg-gray-100 cursor-not-allowed"}`}
                      placeholder="Tell potential clients about your experience, expertise, and what makes you unique..."
                      disabled={!isEditing}
                      aria-invalid={errors.bio ? "true" : "false"}
                    />
                    {errors.bio && (
                      <p className="text-sm text-red-600 mt-2" role="alert">{errors.bio.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {watch("bio")?.length || 0}/2000 characters (minimum 10)
                    </p>
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {activeSection === "skills" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-[#227C70]" />
                      Skills & Categories
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Define your expertise areas</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
                      </label>
                      <textarea
                        {...register("skills", { 
                          required: "At least one skill is required",
                          validate: (value) => {
                            if (!value) return true;
                            const skills = value.split(',').filter(s => s.trim());
                            return skills.length > 0 || "At least one skill is required";
                          }
                        })}
                        rows={6}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all resize-none text-gray-900 ${
                          errors.skills ? "border-red-300" : "border-gray-200"
                        } ${!isEditing && "bg-gray-100 cursor-not-allowed"}`}
                        placeholder="React, Node.js, Python, UI/UX Design, Project Management..."
                        disabled={!isEditing}
                        aria-invalid={errors.skills ? "true" : "false"}
                      />
                      {errors.skills && (
                        <p className="text-sm text-red-600 mt-2" role="alert">{errors.skills.message}</p>
                      )}
                      {watch("skills") && !errors.skills && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {watch("skills").split(",").filter(s => s.trim()).map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-[#227C70]/10 text-[#227C70] rounded-full text-sm">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categories <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
                      </label>
                      <textarea
                        {...register("categories", { 
                          required: "At least one category is required",
                          validate: (value) => {
                            if (!value) return true;
                            const categories = value.split(',').filter(c => c.trim());
                            return categories.length > 0 || "At least one category is required";
                          }
                        })}
                        rows={6}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all resize-none text-gray-900 ${
                          errors.categories ? "border-red-300" : "border-gray-200"
                        } ${!isEditing && "bg-gray-100 cursor-not-allowed"}`}
                        placeholder="Web Development, Mobile Apps, Graphic Design, Marketing..."
                        disabled={!isEditing}
                        aria-invalid={errors.categories ? "true" : "false"}
                      />
                      {errors.categories && (
                        <p className="text-sm text-red-600 mt-2" role="alert">{errors.categories.message}</p>
                      )}
                      {watch("categories") && !errors.categories && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {watch("categories").split(",").filter(c => c.trim()).map((category, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {category.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Education Section */}
              {activeSection === "education" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-[#227C70]" />
                        Education
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">Add your academic background</p>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => appendEducation({ degree: "", institution: "", year_completed: "" })}
                        className="flex items-center gap-2 px-4 py-2 bg-[#227C70] text-white rounded-xl hover:bg-[#1a6357] transition-all text-sm font-medium shadow-sm hover:shadow"
                      >
                        <Plus className="h-4 w-4" />
                        Add Education
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {educationFields.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600 font-medium">No education entries yet</p>
                        <p className="text-sm text-gray-500 mt-1">Add your educational background to build trust</p>
                      </div>
                    )}

                    {educationFields.map((item, index) => (
                      <div key={item.id} className="relative group">
                        <div className="border border-gray-200 rounded-xl p-5 hover:border-[#227C70] transition-all">
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeEducation(index)}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                              aria-label="Remove education entry"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Degree *</label>
                              <input
                                {...register(`education.${index}.degree`, { 
                                  required: "Degree is required",
                                  maxLength: { value: 200, message: "Degree must not exceed 200 characters" }
                                })}
                                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all text-gray-900 ${
                                  !isEditing && "bg-gray-100 cursor-not-allowed"
                                }`}
                                placeholder="Bachelor of Science"
                                disabled={!isEditing}
                                aria-invalid={errors.education?.[index]?.degree ? "true" : "false"}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Institution *</label>
                              <input
                                {...register(`education.${index}.institution`, { 
                                  required: "Institution is required",
                                  maxLength: { value: 200, message: "Institution must not exceed 200 characters" }
                                })}
                                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all text-gray-900 ${
                                  !isEditing && "bg-gray-100 cursor-not-allowed"
                                }`}
                                placeholder="University Name"
                                disabled={!isEditing}
                                aria-invalid={errors.education?.[index]?.institution ? "true" : "false"}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Year *</label>
                              <input
                                {...register(`education.${index}.year_completed`, { 
                                  required: "Year is required",
                                  pattern: {
                                    value: /^\d{4}$/,
                                    message: "Please enter a valid year"
                                  },
                                  min: { value: 1900, message: "Year must be after 1900" },
                                  max: { value: new Date().getFullYear(), message: "Year cannot be in the future" }
                                })}
                                type="number"
                                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all text-gray-900 ${
                                  !isEditing && "bg-gray-100 cursor-not-allowed"
                                }`}
                                placeholder="2020"
                                disabled={!isEditing}
                                aria-invalid={errors.education?.[index]?.year_completed ? "true" : "false"}
                              />
                            </div>
                          </div>
                          {errors.education?.[index] && (
                            <p className="text-xs text-red-600 mt-2">
                              {Object.values(errors.education[index]).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Section */}
              {activeSection === "experience" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#227C70]" />
                        Work Experience
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">Add your professional experience</p>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => appendExperience({ company: "", role: "", start_date: "", end_date: "" })}
                        className="flex items-center gap-2 px-4 py-2 bg-[#227C70] text-white rounded-xl hover:bg-[#1a6357] transition-all text-sm font-medium shadow-sm hover:shadow"
                      >
                        <Plus className="h-4 w-4" />
                        Add Experience
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {experienceFields.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600 font-medium">No experience entries yet</p>
                        <p className="text-sm text-gray-500 mt-1">Share your work history with potential clients</p>
                      </div>
                    )}

                    {experienceFields.map((item, index) => (
                      <div key={item.id} className="relative group">
                        <div className="border border-gray-200 rounded-xl p-5 hover:border-[#227C70] transition-all">
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeExperience(index)}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                              aria-label="Remove experience entry"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Company *</label>
                              <input
                                {...register(`experience.${index}.company`, { 
                                  required: "Company is required",
                                  maxLength: { value: 200, message: "Company must not exceed 200 characters" }
                                })}
                                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all text-gray-900 ${
                                  !isEditing && "bg-gray-100 cursor-not-allowed"
                                }`}
                                placeholder="Company Name"
                                disabled={!isEditing}
                                aria-invalid={errors.experience?.[index]?.company ? "true" : "false"}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Role *</label>
                              <input
                                {...register(`experience.${index}.role`, { 
                                  required: "Role is required",
                                  maxLength: { value: 200, message: "Role must not exceed 200 characters" }
                                })}
                                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all text-gray-900 ${
                                  !isEditing && "bg-gray-100 cursor-not-allowed"
                                }`}
                                placeholder="Job Title"
                                disabled={!isEditing}
                                aria-invalid={errors.experience?.[index]?.role ? "true" : "false"}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date *</label>
                              <input
                                {...register(`experience.${index}.start_date`, { 
                                  required: "Start date is required",
                                  pattern: {
                                    value: /^\d{4}-\d{2}-\d{2}$/,
                                    message: "Please enter a valid date"
                                  }
                                })}
                                type="date"
                                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all text-gray-900 ${
                                  !isEditing && "bg-gray-100 cursor-not-allowed"
                                }`}
                                disabled={!isEditing}
                                aria-invalid={errors.experience?.[index]?.start_date ? "true" : "false"}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                              <input
                                {...register(`experience.${index}.end_date`, {
                                  validate: (value, formValues) => {
                                    if (!value) return true;
                                    const startDate = formValues.experience[index].start_date;
                                    if (startDate && value < startDate) {
                                      return "End date cannot be before start date";
                                    }
                                    return true;
                                  }
                                })}
                                type="date"
                                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#227C70]/20 transition-all text-gray-900 ${
                                  !isEditing && "bg-gray-100 cursor-not-allowed"
                                }`}
                                disabled={!isEditing}
                                aria-invalid={errors.experience?.[index]?.end_date ? "true" : "false"}
                              />
                              <p className="text-xs text-gray-500 mt-1">Leave blank if current</p>
                            </div>
                          </div>
                          {errors.experience?.[index] && (
                            <p className="text-xs text-red-600 mt-2">
                              {Object.values(errors.experience[index]).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Section */}
              {activeSection === "portfolio" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-[#227C70]" />
                        Portfolio Projects
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">Showcase your best work</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenPortfolioModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-[#227C70] text-white rounded-xl hover:bg-[#1a6357] transition-all text-sm font-medium shadow-sm hover:shadow"
                    >
                      <Plus className="h-4 w-4" />
                      Add Project
                    </button>
                  </div>

                  <div className="space-y-4">
                    {portfolioLoading && (
                      <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#227C70]" />
                        <p className="text-gray-600 mt-3">Loading your projects...</p>
                      </div>
                    )}

                    {!portfolioLoading && (!portfolio || !Array.isArray(portfolio) || portfolio.length === 0) && (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600 font-medium">No portfolio projects yet</p>
                        <p className="text-sm text-gray-500 mt-1">Add your first project to showcase your work</p>
                        <button
                          onClick={() => handleOpenPortfolioModal()}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#227C70] text-white rounded-xl hover:bg-[#1a6357] transition-all text-sm font-medium"
                        >
                          <Plus className="h-4 w-4" />
                          Add Your First Project
                        </button>
                      </div>
                    )}

                    {!portfolioLoading && Array.isArray(portfolio) && portfolio.length > 0 && (
                      <div className="grid grid-cols-1 gap-4">
                        {portfolio.map((project) => (
                          <div key={project.id} className="group border border-gray-200 rounded-xl p-5 hover:border-[#227C70] hover:shadow-md transition-all">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 bg-[#227C70]/10 rounded-lg flex items-center justify-center">
                                    <FolderOpen className="h-5 w-5 text-[#227C70]" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                                    <p className="text-xs text-gray-500">Added {new Date(project.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                                {project.link && (
                                  <a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#227C70] hover:text-[#1a6357] inline-flex items-center gap-1"
                                  >
                                    View Project <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                              <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => handleOpenPortfolioModal(project)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Edit project"
                                  aria-label="Edit project"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePortfolio(project.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete project"
                                  aria-label="Delete project"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons - Only show for non-portfolio sections when editing */}
              {activeSection !== "portfolio" && isEditing && (
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                      if (profile?.profile_picture) {
                        setProfilePreview(profile.profile_picture);
                      }
                      if (profile?.resume) {
                        setResumeFileName(profile.resume.split('/').pop());
                      }
                    }}
                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isProfileValid() || !isDirty}
                    className="flex items-center gap-2 px-6 py-3 bg-[#227C70] text-white rounded-xl hover:bg-[#1a6357] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    title={!isProfileValid() ? "Please fill all required fields" : ""}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}