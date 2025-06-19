
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Briefcase, Heart, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = ({ user }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate('/');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">JobPortal</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors">
              Find Jobs
            </Link>
            <Link to="/companies" className="text-gray-700 hover:text-blue-600 transition-colors">
              Companies
            </Link>
            {user && (
              <>
                <Link to="/saved-jobs" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Saved Jobs
                </Link>
                <Link to="/applications" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Applications
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/notifications')}>
                  <Bell className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/saved-jobs')}>
                      <Heart className="h-4 w-4 mr-2" />
                      Saved Jobs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
