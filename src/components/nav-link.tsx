import {Link} from "react-router-dom";
import {Button} from "./ui/button.tsx";
import astroLogo from "../assets/icon-astronacci.png";
import { useAuthLogout } from "../services/auth/hooks/use-auth-logout";
import { Loader2 } from "lucide-react";

export function Navbar(){
   const logout = useAuthLogout();

   const handleLogout = () => {
      logout.mutate();
   };

   return (
     <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6 bg-black text-white">
        <Link className="flex items-center gap-2" to="#">
           <img
             alt="Astronacci Logo"
             src={astroLogo}
             className="h-10"
           />
        </Link>
        
        <div className="flex items-center space-x-4">
           <span className="text-sm">Developer</span>
           <Button 
              variant={"secondary"} 
              onClick={handleLogout}
              disabled={logout.isPending}
           >
              {logout.isPending ? (
                 <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                 "Logout"
              )}
           </Button>
        </div>
     </header>
   )
}