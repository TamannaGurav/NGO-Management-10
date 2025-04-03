import React, { useState, useEffect } from 'react';
// import { useUser } from "../UserContext";
import { Button, Form, Container, Alert } from 'react-bootstrap'; // Keep Container, Form elements
import {
    User,
    Mail,
    Cake, // Added for DOB
    Phone,
    Briefcase, // Added for Occupation
    MapPin,
    Edit,
    Save,
    X,
    Loader2,
    CalendarDays // More specific icon for DOB
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css'; // Keep for basic structure if needed

// Helper to format date string (YYYY-MM-DD) nicely
const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
        const date = new Date(dateString);
        // Adjust for potential timezone issues if the input is just YYYY-MM-DD
        const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        return utcDate.toLocaleDateString(undefined, { // Use user's locale
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString; // Fallback to original string
    }
};


const ProfilePage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState(null); // Holds data during editing
    const [isLoading, setIsLoading] = useState(true); // Start loading initially
    const [isSaving, setIsSaving] = useState(false); // Separate state for saving operation
    const [error, setError] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token') || ''); // Initialize token from localStorage

    // Map field names to icons
    const iconMap = {
        name: <User size={18} className="text-gray-400" />,
        email: <Mail size={18} className="text-gray-400" />,
        dob: <CalendarDays size={18} className="text-gray-400" />,
        phone: <Phone size={18} className="text-gray-400" />,
        occupation: <Briefcase size={18} className="text-gray-400" />,
        location: <MapPin size={18} className="text-gray-400" />,
    };

    // Fields to display and edit
    const profileFields = ['name', 'email', 'dob', 'phone', 'occupation', 'location'];

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setError('Authentication token is missing. Please log in.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/me`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                   const errorData = await response.json().catch(() => ({})); // Try to parse error response
                   throw new Error(errorData.message || `Failed to fetch profile: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                 // Ensure essential fields exist, provide defaults if necessary
                const profileData = {
                    ...data,
                    name: data.name || '',
                    email: data.email || '',
                    dob: data.dob || '', // API should ideally return YYYY-MM-DD format
                    phone: data.phone || '',
                    occupation: data.occupation || '',
                    location: data.location || '',
                    avatarUrl: data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random&size=256`, // Fallback avatar
                    _id: data._id // Ensure _id is present
                };
                setUserProfile(profileData);
                setTempProfile(profileData); // Initialize temp profile

            } catch (err) {
                console.error("Fetch Profile Error:", err);
                setError(err.message || 'An unexpected error occurred while fetching profile data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [token]); // Dependency array includes token

    // Edit mode toggle
    const handleEdit = () => {
        if (!userProfile) return;
        setTempProfile({ ...userProfile }); // Reset temp profile to current saved state
        setIsEditing(true);
    };

    // Save profile changes
    const handleSave = async () => {
        if (!tempProfile || !tempProfile._id || !token) {
            setError('Cannot save profile. User data or authentication is missing.');
            return;
        }

        setIsSaving(true);
        setError(null);

        // Only include fields that are part of the editable form
        const updatePayload = {};
        profileFields.forEach(field => {
            // Ensure you only send fields the API expects/can update
            // Avoid sending fields like _id or avatarUrl if the PUT endpoint doesn't handle them
             if (field !== '_id' && field !== 'avatarUrl') { // Example exclusion
                 updatePayload[field] = tempProfile[field];
             }
        });


        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/members/${tempProfile._id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload), // Send only editable fields
            });

             if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to save profile: ${response.status} ${response.statusText}`);
            }

            const updatedData = await response.json();

            // Assuming API returns the updated member object or similar structure
            const updatedMember = updatedData.member || updatedData;

            // Merge the updates into the main userProfile state
             const newProfile = {
                ...userProfile, // Keep existing non-updated fields (like avatarUrl, _id)
                ...updatedMember // Overwrite with updated fields from response
             };

            setUserProfile(newProfile);
            setTempProfile(newProfile); // Update temp profile as well
            setIsEditing(false);

            
// ✅ Store profile in "user" (not "userProfile")
localStorage.setItem('user', JSON.stringify(newProfile));

// ✅ Trigger navbar update
window.dispatchEvent(new Event("userUpdated"));


        } catch (err) {
            console.error("Save Profile Error:", err);
            setError(err.message || 'An unexpected error occurred while saving the profile.');
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        // No need to reset tempProfile here, as handleEdit resets it when entering edit mode again.
        // If you want immediate revert on cancel: setTempProfile({...userProfile});
        setError(null); // Clear any previous save errors
    };

    // Handle input changes during editing
    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempProfile((prev) => ({ ...prev, [name]: value }));
    };

    // Loading State UI
    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Loader2 className="w-16 h-16 animate-spin text-purple-400" />
            </Container>
        );
    }

    // Error State UI (Improved Alert)
    if (error && !userProfile) { // Show full page error if profile couldn't load
         return (
            <Container className="mt-5">
                <Alert variant="danger" className="shadow-lg border border-red-500/30 bg-red-500/10 text-red-200">
                    <Alert.Heading className="flex items-center gap-2">
                       <X size={20} /> Error Loading Profile
                    </Alert.Heading>
                    <p>{error}</p>
                    {error.includes('Authentication token') && (
                        <Button variant="primary" onClick={() => { /* Redirect to login */ }}>Go to Login</Button>
                    )}
                </Alert>
            </Container>
        );
    }


    // Main Profile UI
    return (
        <Container className="mt-5 mb-5 max-w-4xl mx-auto px-3"> {/* Added max-width and horizontal centering */}
            {/* Page Title */}
             <h1 className="text-center text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-6 md:mb-10">
                My Profile
            </h1>

            {/* General Error Display (e.g., for save errors) */}
             {error && isEditing && ( // Only show save errors while editing
                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4 shadow-md border border-red-500/30 bg-red-500/10 text-red-200">
                        <strong>Save Error:</strong> {error}
                    </Alert>
                 </motion.div>
             )}


            {!userProfile ? (
                // This case should ideally be handled by the error state above if loading fails
                <div className="text-center text-gray-400 py-10">No profile data available.</div>
            ) : (
                // Profile Card
                <div className="profile-container bg-slate-800/50 border border-slate-700/50 shadow-2xl backdrop-blur-lg rounded-xl overflow-hidden"> {/* Changed bg slightly */}

                    {/* Optional Header inside the card */}
                     <div className="profile-header p-4 border-b border-slate-700/50">
                        <h2 className="text-2xl font-semibold text-gray-100 text-center">
                             Profile Information
                         </h2>
                    </div>


                    {/* Profile Body */}
                    <div className="profile-body p-5 md:p-8">
                        {/* Avatar and Basic Info Section */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                             <div
                                className="profile-avatar relative flex-shrink-0 rounded-full overflow-hidden border-4 border-purple-500/40 shadow-lg"
                                style={{ width: '10rem', height: '10rem' }} // Slightly smaller avatar
                             >
                                <motion.img
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    src={userProfile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name || 'User')}&background=random&size=256`} // Fallback inside src
                                    alt={`${userProfile.name}'s avatar`}
                                    className="w-full h-full object-cover" // Ensure image covers the circle
                                    onError={(e) => { // Handle broken image links
                                        e.target.onerror = null; // prevent infinite loop
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name || 'User')}&background=random&size=256`;
                                    }}
                                />
                            </div>
                            <div className='flex-grow text-center sm:text-left mt-4 sm:mt-0'>
                                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-1">{userProfile.name || 'User Name'}</h2>
                                <p className="text-lg text-purple-300 mb-2">{userProfile.occupation || 'Occupation not set'}</p>
                                <p className="text-gray-300 flex items-center justify-center sm:justify-start gap-2">
                                    <MapPin className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                    {userProfile.location || 'Location not set'}
                                </p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <Form className="profile-form space-y-5"> {/* Use space-y for vertical spacing */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"> {/* Tailwind grid */}
                                {profileFields.map((field) => (
                                    <div key={field}>
                                         {/* Label with Icon */}
                                         <Form.Label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                             {iconMap[field]}
                                             {field.charAt(0).toUpperCase() + field.slice(1).replace('dob', 'Date of Birth')} {/* Nicer label */}
                                         </Form.Label>

                                        {/* Conditional Rendering: Text or Input */}
                                        {isEditing ? (
                                            <Form.Control
                                                type={field === 'dob' ? 'date' : field === 'email' ? 'email' : 'text'}
                                                name={field} // Use name attribute for handleChange
                                                value={tempProfile ? tempProfile[field] : ''}
                                                onChange={handleChange}
                                                className="form-control bg-slate-700/60 border border-slate-600 text-gray-100 placeholder-gray-400 focus:border-purple-400 focus:ring focus:ring-purple-400/30 rounded-md shadow-sm transition duration-150 ease-in-out" // Enhanced styling
                                                placeholder={`Enter your ${field}`}
                                                disabled={isSaving} // Disable while saving
                                            />
                                        ) : (
                                             <div className="p-3 min-h-[40px] bg-slate-700/40 border border-transparent rounded-md text-gray-200"> {/* Display Box */}
                                                 {field === 'dob'
                                                     ? formatDate(userProfile[field])
                                                     : userProfile[field] || <span className="text-gray-500 italic">Not specified</span>}
                                             </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Form>
                    </div>

                    {/* Footer with Action Buttons */}
                    <div className="profile-footer flex justify-end items-center gap-3 p-4 bg-slate-800/30 border-t border-slate-700/50 rounded-b-xl">
                        <AnimatePresence initial={false}> {/* AnimatePresence for smooth transitions */}
                            {isEditing ? (
                                <>
                                    {/* Cancel Button */}
                                    <motion.div
                                        key="cancel"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                         <Button
                                             variant="outline-secondary" // Use Bootstrap outline for structure
                                             className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white transition-colors duration-150" // Tailwind for detailed styling
                                             onClick={handleCancel}
                                             disabled={isSaving}
                                         >
                                            <X size={18} /> Cancel
                                        </Button>
                                    </motion.div>

                                    {/* Save Button */}
                                    <motion.div
                                        key="save"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.2, delay: 0.05 }}
                                    >
                                        <Button
                                            variant="primary" // Use Bootstrap variant for base
                                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md hover:from-purple-600 hover:to-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 ease-in-out" // Tailwind for gradient and details
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" /> Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} /> Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </>
                            ) : (
                                /* Edit Button */
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                     <Button
                                         variant="outline-info" // Bootstrap base
                                         className="flex items-center gap-2 px-4 py-2 rounded-md text-blue-300 border-blue-500/50 hover:bg-blue-500/20 hover:text-blue-200 transition-colors duration-150" // Tailwind for style
                                         onClick={handleEdit}
                                     >
                                        <Edit size={18} /> Edit Profile
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default ProfilePage;