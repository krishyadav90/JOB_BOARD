import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import JobFilter from './components/JobFilter';
import JobList from './components/JobList';
import Auth from './components/Auth';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch current user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Fetch jobs from Supabase
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching jobs:', error);
      } else {
        setJobs(data);
        const uniqueCategories = [...new Set(data.map((job) => job.category))];
        setCategories(uniqueCategories);
      }
    };
    fetchJobs();

    // Set up real-time subscription for new jobs
    const jobSubscription = supabase
      .channel('public:jobs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (payload) => {
        setJobs((prevJobs) => [payload.new, ...prevJobs]);
        if (user) {
          // Add notification for new job if it matches user preferences
          supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              message: `New job posted: ${payload.new.title} at ${payload.new.company}`,
            })
            .then(({ error }) => {
              if (error) console.error('Error adding notification:', error);
            });
        }
      })
      .subscribe();

    // Fetch user notifications
    const fetchNotifications = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Error fetching notifications:', error);
        } else {
          setNotifications(data);
        }
      }
    };
    fetchNotifications();

    // Cleanup subscriptions on unmount
    return () => {
      jobSubscription.unsubscribe();
      authListener.subscription.unsubscribe();
    };
  }, [user]);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? job.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <Router>
      <div className="container mx-auto p-6">
        <nav className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            <Link to="/">Job Portal</Link>
          </h1>
          <div className="flex gap-4">
            {user ? (
              <>
                <Link to="/profile" className="text-blue-600 hover:underline">
                  Profile ({notifications.length} notifications)
                </Link>
                {user && user.user_metadata?.role === 'admin' && (
                  <Link to="/admin" className="text-blue-600 hover:underline">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="text-red-600 hover:underline">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            )}
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <>
                <JobFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
                {filteredJobs.length > 0 ? (
                  <JobList jobs={filteredJobs} user={user} />
                ) : (
                  <p className="text-center text-gray-500">No jobs found.</p>
                )}
              </>
            }
          />
          <Route path="/login" element={<Auth setUser={setUser} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;